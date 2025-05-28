import { describe, it, expect } from 'vitest';
import { generateSampleData } from './sampleData.js';
import { events as initialEventsData } from './events.js';
import { members as membersListData } from './members.js';

describe('generateSampleData', () => {
    it('Test Case 1: should skip exceptional dates for choir rehearsals', () => {
        const exceptionalDates = ['2025-03-11']; // Assuming this is a Tuesday
        const data = generateSampleData(initialEventsData, membersListData, exceptionalDates, []);
        const skippedRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-03-11');
        expect(skippedRehearsal).toBeUndefined();

        const nextRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-03-18');
        expect(nextRehearsal).toBeDefined();
        expect(nextRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 2: should skip exceptional timespans for choir rehearsals', () => {
        const exceptionalTimespans = [{ start: '2025-04-01', end: '2025-04-10' }];
        const data = generateSampleData(initialEventsData, membersListData, [], exceptionalTimespans);

        const skippedRehearsal1 = data.find(item => item.type === 'chorprobe' && item.date === '2025-04-01');
        expect(skippedRehearsal1).toBeUndefined();
        const skippedRehearsal2 = data.find(item => item.type === 'chorprobe' && item.date === '2025-04-08');
        expect(skippedRehearsal2).toBeUndefined();

        const nextRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-04-15');
        expect(nextRehearsal).toBeDefined();
        expect(nextRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 3: should generate choir rehearsals by default (no exceptions)', () => {
        const data = generateSampleData(initialEventsData, membersListData);
        const firstTuesdayRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-01-07');
        expect(firstTuesdayRehearsal).toBeDefined();
        expect(firstTuesdayRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 4: should skip default Sommerferien timespan', () => {
        const data = generateSampleData(initialEventsData, membersListData, [], []); // Sommerferien '2025-07-07' to '2025-07-29'

        // Check for rehearsals within the default vacation period
        const skippedRehearsalJuly8 = data.find(item => item.type === 'chorprobe' && item.date === '2025-07-08');
        expect(skippedRehearsalJuly8).toBeUndefined();
        const skippedRehearsalJuly15 = data.find(item => item.type === 'chorprobe' && item.date === '2025-07-15');
        expect(skippedRehearsalJuly15).toBeUndefined();
        const skippedRehearsalJuly22 = data.find(item => item.type === 'chorprobe' && item.date === '2025-07-22');
        expect(skippedRehearsalJuly22).toBeUndefined();
        const skippedRehearsalJuly29 = data.find(item => item.type === 'chorprobe' && item.date === '2025-07-29');
        expect(skippedRehearsalJuly29).toBeUndefined();

        // Check for rehearsals before and after the vacation period
        const rehearsalBeforeVacation = data.find(item => item.type === 'chorprobe' && item.date === '2025-07-01');
        expect(rehearsalBeforeVacation).toBeDefined();
        expect(rehearsalBeforeVacation.title).toBe('Chorprobe');

        const rehearsalAfterVacation = data.find(item => item.type === 'chorprobe' && item.date === '2025-08-05');
        expect(rehearsalAfterVacation).toBeDefined();
        expect(rehearsalAfterVacation.title).toBe('Chorprobe');
    });

    describe('DST and Date Generation Logic Tests', () => {
        const allGeneratedData = generateSampleData(initialEventsData, membersListData, [], []);
        const allChoirProben = allGeneratedData.filter(item => item.type === 'chorprobe');

        it('Test Case 5: Consistent Tuesday Generation Across DST', () => {
            const dstTestDates = [
                '2025-03-25', // Tuesday before DST start
                '2025-04-01', // Tuesday after DST start
                '2025-10-21', // Tuesday before DST end
                '2025-10-28', // Tuesday after DST end
            ];

            dstTestDates.forEach(dateStr => {
                const rehearsal = allChoirProben.find(item => item.date === dateStr);
                expect(rehearsal).toBeDefined();
                expect(rehearsal.title).toBe('Chorprobe');
                // Optionally, check time if it was part of the object, but it's fixed at 19:00-20:30
            });
        });

        it('Test Case 6: No rehearsals on other days (spot check)', () => {
            const notATuesday = '2025-03-24'; // Monday
            const rehearsal = allChoirProben.find(item => item.date === notATuesday);
            expect(rehearsal).toBeUndefined();
        });

        it('Test Case 7: Reasonable number of rehearsals in 2025', () => {
            // 2025 has 52 Tuesdays.
            // Sommerferien (July 7 to July 29) skip 4 Tuesdays (July 8, 15, 22, 29).
            // initialEventsData does not have any events on Tuesdays.
            const expectedRehearsals = 52 - 4;
            expect(allChoirProben.length).toBe(expectedRehearsals);
        });
    });
});
