import { describe, it, expect } from 'vitest';
import { generateSampleData } from './sampleData.js';

describe('generateSampleData', () => {
    it('Test Case 1: should skip exceptional dates for choir rehearsals', () => {
        const exceptionalDates = ['2025-03-11']; // Assuming this is a Tuesday
        const data = generateSampleData(exceptionalDates, []);
        const skippedRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-03-11');
        expect(skippedRehearsal).toBeUndefined();

        const nextRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-03-18');
        expect(nextRehearsal).toBeDefined();
        expect(nextRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 2: should skip exceptional timespans for choir rehearsals', () => {
        const exceptionalTimespans = [{ start: '2025-04-01', end: '2025-04-10' }];
        const data = generateSampleData([], exceptionalTimespans);

        const skippedRehearsal1 = data.find(item => item.type === 'chorprobe' && item.date === '2025-04-01');
        expect(skippedRehearsal1).toBeUndefined();
        const skippedRehearsal2 = data.find(item => item.type === 'chorprobe' && item.date === '2025-04-08');
        expect(skippedRehearsal2).toBeUndefined();

        const nextRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-04-15');
        expect(nextRehearsal).toBeDefined();
        expect(nextRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 3: should generate choir rehearsals by default (no exceptions)', () => {
        const data = generateSampleData();
        const firstTuesdayRehearsal = data.find(item => item.type === 'chorprobe' && item.date === '2025-01-07');
        expect(firstTuesdayRehearsal).toBeDefined();
        expect(firstTuesdayRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 4: should skip default Sommerferien timespan', () => {
        const data = generateSampleData(); // Sommerferien '2025-07-07' to '2025-07-29'

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
});
