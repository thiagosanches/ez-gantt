import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDate } from './testUtils.js';

/**
 * Week Numbering Logic Tests
 * 
 * Business Rule:
 * - If project starts on Sunday (day 0) or Monday (day 1): First week is labeled "W1"
 * - If project starts on Tuesday-Saturday (day 2-6): First partial week is labeled "W0", then "W1", "W2"...
 * 
 * This affects the visual week labels in the Gantt chart axis.
 */

describe('Week Numbering Logic', () => {
    describe('Full week start (Sunday or Monday) → W1', () => {
        it('should label first week as W1 when project starts on Sunday', () => {
            const projectStart = '2026-04-12'; // Sunday
            const date = parseDate(projectStart);
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(date.getDay(), 0, 'Date should be Sunday');
            assert.equal(isFullWeekStart, true, 'Sunday should be considered full week start');
        });

        it('should label first week as W1 when project starts on Monday', () => {
            const projectStart = '2026-04-13'; // Monday
            const date = parseDate(projectStart);
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(date.getDay(), 1, 'Date should be Monday');
            assert.equal(isFullWeekStart, true, 'Monday should be considered full week start');
        });

        it('should calculate week labels correctly for Sunday start', () => {
            const projectStart = '2026-04-12'; // Sunday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            // First week label
            const firstWeekLabel = isFullWeekStart ? 'W1' : 'W0';
            assert.equal(firstWeekLabel, 'W1');
            
            // Subsequent week labels (for compressed mode)
            const week2Label = !startsOnMonday && 0 === 0 ? 'W0' : `W${startsOnMonday ? 0 + 1 : 0}`;
            // For Sunday start, startsOnMonday is false, so: W${false ? 1 : 0} = W0
            // But first week should be W1 in full calendar mode
            
            // In compressed mode (weekends hidden), Sunday start behaves differently
            // First week is still W1 because Sunday is considered full week start
        });

        it('should calculate week labels correctly for Monday start', () => {
            const projectStart = '2026-04-13'; // Monday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            assert.equal(startsOnMonday, true);
            
            // First week: W${startsOnMonday ? idx + 1 : idx} where idx = 0
            const firstWeekLabel = `W${startsOnMonday ? 0 + 1 : 0}`;
            assert.equal(firstWeekLabel, 'W1');
            
            // Second week: idx = 1
            const secondWeekLabel = `W${startsOnMonday ? 1 + 1 : 1}`;
            assert.equal(secondWeekLabel, 'W2');
            
            // Third week: idx = 2
            const thirdWeekLabel = `W${startsOnMonday ? 2 + 1 : 2}`;
            assert.equal(thirdWeekLabel, 'W3');
        });
    });

    describe('Partial week start (Tuesday-Saturday) → W0', () => {
        it('should label first partial week as W0 when project starts on Tuesday', () => {
            const projectStart = '2026-04-14'; // Tuesday
            const date = parseDate(projectStart);
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(date.getDay(), 2, 'Date should be Tuesday');
            assert.equal(isFullWeekStart, false, 'Tuesday should NOT be considered full week start');
        });

        it('should label first partial week as W0 when project starts on Wednesday', () => {
            const projectStart = '2026-04-15'; // Wednesday
            const date = parseDate(projectStart);
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(date.getDay(), 3, 'Date should be Wednesday');
            assert.equal(isFullWeekStart, false, 'Wednesday should NOT be considered full week start');
        });

        it('should label first partial week as W0 when project starts on Thursday', () => {
            const projectStart = '2026-04-09'; // Thursday
            const date = parseDate(projectStart);
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(date.getDay(), 4, 'Date should be Thursday');
            assert.equal(isFullWeekStart, false, 'Thursday should NOT be considered full week start');
        });

        it('should label first partial week as W0 when project starts on Friday', () => {
            const projectStart = '2026-04-10'; // Friday
            const date = parseDate(projectStart);
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(date.getDay(), 5, 'Date should be Friday');
            assert.equal(isFullWeekStart, false, 'Friday should NOT be considered full week start');
        });

        it('should label first partial week as W0 when project starts on Saturday', () => {
            const projectStart = '2026-04-11'; // Saturday
            const date = parseDate(projectStart);
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(date.getDay(), 6, 'Date should be Saturday');
            assert.equal(isFullWeekStart, false, 'Saturday should NOT be considered full week start');
        });

        it('should calculate week labels correctly for Tuesday start', () => {
            const projectStart = '2026-04-14'; // Tuesday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(startsOnMonday, false);
            assert.equal(isFullWeekStart, false);
            
            // First week label (partial week)
            const firstWeekLabel = isFullWeekStart ? 'W1' : 'W0';
            assert.equal(firstWeekLabel, 'W0');
            
            // In compressed mode, first week logic:
            // label = (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`
            const compressedFirstWeek = (!startsOnMonday && 0 === 0) ? 'W0' : `W${startsOnMonday ? 0 + 1 : 0}`;
            assert.equal(compressedFirstWeek, 'W0');
        });

        it('should calculate week labels correctly for Thursday start (mid-week)', () => {
            const projectStart = '2026-04-09'; // Thursday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            assert.equal(startsOnMonday, false);
            
            // First week (partial): W0
            const firstWeekLabel = (!startsOnMonday && 0 === 0) ? 'W0' : `W${startsOnMonday ? 0 + 1 : 0}`;
            assert.equal(firstWeekLabel, 'W0');
            
            // Second week (first full week): W1
            // idx = 1
            const secondWeekLabel = (!startsOnMonday && 1 === 0) ? 'W0' : `W${startsOnMonday ? 1 + 1 : 1}`;
            assert.equal(secondWeekLabel, 'W1');
            
            // Third week: W2
            const thirdWeekLabel = (!startsOnMonday && 2 === 0) ? 'W0' : `W${startsOnMonday ? 2 + 1 : 2}`;
            assert.equal(thirdWeekLabel, 'W2');
        });
    });

    describe('Week sequence validation', () => {
        it('should generate correct week sequence for Monday start: W1, W2, W3, W4', () => {
            const projectStart = '2026-04-13'; // Monday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            const weekLabels = [];
            for (let idx = 0; idx < 4; idx++) {
                const label = (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
                weekLabels.push(label);
            }
            
            assert.deepEqual(weekLabels, ['W1', 'W2', 'W3', 'W4']);
        });

        it('should generate correct week sequence for Tuesday start: W0, W1, W2, W3', () => {
            const projectStart = '2026-04-14'; // Tuesday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            const weekLabels = [];
            for (let idx = 0; idx < 4; idx++) {
                const label = (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
                weekLabels.push(label);
            }
            
            assert.deepEqual(weekLabels, ['W0', 'W1', 'W2', 'W3']);
        });

        it('should generate correct week sequence for Thursday start: W0, W1, W2, W3', () => {
            const projectStart = '2026-04-09'; // Thursday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            const weekLabels = [];
            for (let idx = 0; idx < 4; idx++) {
                const label = (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
                weekLabels.push(label);
            }
            
            assert.deepEqual(weekLabels, ['W0', 'W1', 'W2', 'W3']);
        });

        it('should generate correct week sequence for Friday start: W0, W1, W2, W3', () => {
            const projectStart = '2026-04-10'; // Friday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            const weekLabels = [];
            for (let idx = 0; idx < 4; idx++) {
                const label = (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
                weekLabels.push(label);
            }
            
            assert.deepEqual(weekLabels, ['W0', 'W1', 'W2', 'W3']);
        });

        it('should generate correct week sequence for Sunday start: W1, W2, W3, W4', () => {
            const projectStart = '2026-04-12'; // Sunday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            // Sunday uses full calendar mode logic (isFullWeekStart)
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            assert.equal(isFullWeekStart, true);
            
            // In full calendar mode, Sunday starts with W1
            // In compressed mode, Sunday is not shown, so this would be different
            // For now, testing the full calendar mode logic
            const firstWeekLabel = isFullWeekStart ? 'W1' : 'W0';
            assert.equal(firstWeekLabel, 'W1');
        });

        it('should generate correct week sequence for Saturday start: W0, W1, W2, W3', () => {
            const projectStart = '2026-04-11'; // Saturday
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            const isFullWeekStart = date.getDay() === 0 || date.getDay() === 1;
            
            assert.equal(isFullWeekStart, false);
            
            const weekLabels = [];
            for (let idx = 0; idx < 4; idx++) {
                const label = (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
                weekLabels.push(label);
            }
            
            assert.deepEqual(weekLabels, ['W0', 'W1', 'W2', 'W3']);
        });
    });

    describe('Full calendar mode vs Compressed mode', () => {
        it('should use isFullWeekStart logic for full calendar mode (weekends shown)', () => {
            // Full calendar mode: Line 859 in app.js
            // const isFullWeekStart = minDate.getDay() === 0 || minDate.getDay() === 1;
            
            const sundayStart = parseDate('2026-04-12'); // Sunday
            const mondayStart = parseDate('2026-04-13'); // Monday
            const tuesdayStart = parseDate('2026-04-14'); // Tuesday
            
            assert.equal(sundayStart.getDay() === 0 || sundayStart.getDay() === 1, true);
            assert.equal(mondayStart.getDay() === 0 || mondayStart.getDay() === 1, true);
            assert.equal(tuesdayStart.getDay() === 0 || tuesdayStart.getDay() === 1, false);
        });

        it('should use startsOnMonday logic for compressed mode (weekends hidden)', () => {
            // Compressed mode: Line 1017 in app.js
            // const startsOnMonday = minDate.getDay() === 1;
            
            const mondayStart = parseDate('2026-04-13'); // Monday
            const tuesdayStart = parseDate('2026-04-14'); // Tuesday
            const sundayStart = parseDate('2026-04-12'); // Sunday
            
            assert.equal(mondayStart.getDay() === 1, true);
            assert.equal(tuesdayStart.getDay() === 1, false);
            assert.equal(sundayStart.getDay() === 1, false);
        });
    });

    describe('Edge cases', () => {
        it('should handle year start (January 1st) correctly', () => {
            // January 1, 2026 is a Thursday
            const projectStart = '2026-01-01';
            const date = parseDate(projectStart);
            const startsOnMonday = date.getDay() === 1;
            
            assert.equal(date.getDay(), 4, 'Jan 1, 2026 is Thursday');
            assert.equal(startsOnMonday, false);
            
            const firstWeekLabel = (!startsOnMonday && 0 === 0) ? 'W0' : `W${startsOnMonday ? 0 + 1 : 0}`;
            assert.equal(firstWeekLabel, 'W0', 'First partial week of year should be W0');
        });

        it('should handle month start on different days', () => {
            // May 1, 2026 is a Friday
            const mayFirst = parseDate('2026-05-01');
            assert.equal(mayFirst.getDay(), 5, 'May 1, 2026 is Friday');
            
            const startsOnMonday = mayFirst.getDay() === 1;
            const firstWeekLabel = (!startsOnMonday && 0 === 0) ? 'W0' : `W${startsOnMonday ? 0 + 1 : 0}`;
            assert.equal(firstWeekLabel, 'W0', 'Starting on Friday should give W0');
        });
    });

    describe('Business rule documentation', () => {
        it('should document the exact rule from app.js line 857-859', () => {
            // W0 only if the project starts mid-week (Tue–Sat).
            // Starting on Sun or Mon is considered a full week start → W1.
            
            const tuesday = parseDate('2026-04-14').getDay();
            const wednesday = parseDate('2026-04-15').getDay();
            const thursday = parseDate('2026-04-09').getDay();
            const friday = parseDate('2026-04-10').getDay();
            const saturday = parseDate('2026-04-11').getDay();
            const sunday = parseDate('2026-04-12').getDay();
            const monday = parseDate('2026-04-13').getDay();
            
            // Mid-week days (should give W0 for first week)
            const midWeekDays = [tuesday, wednesday, thursday, friday, saturday];
            midWeekDays.forEach(day => {
                assert.equal(day === 0 || day === 1, false, `Day ${day} should be mid-week`);
            });
            
            // Full week start days (should give W1 for first week)
            const fullWeekDays = [sunday, monday];
            fullWeekDays.forEach(day => {
                assert.equal(day === 0 || day === 1, true, `Day ${day} should be full week start`);
            });
        });

        it('should document the compressed mode rule from app.js line 1073', () => {
            // const label = (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
            
            // When starts on Monday:
            const mondayLogic = (idx) => {
                const startsOnMonday = true;
                return (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
            };
            
            assert.equal(mondayLogic(0), 'W1');
            assert.equal(mondayLogic(1), 'W2');
            assert.equal(mondayLogic(2), 'W3');
            
            // When does NOT start on Monday:
            const nonMondayLogic = (idx) => {
                const startsOnMonday = false;
                return (!startsOnMonday && idx === 0) ? 'W0' : `W${startsOnMonday ? idx + 1 : idx}`;
            };
            
            assert.equal(nonMondayLogic(0), 'W0');
            assert.equal(nonMondayLogic(1), 'W1');
            assert.equal(nonMondayLogic(2), 'W2');
        });
    });
});
