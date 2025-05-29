import { describe, it, expect } from 'vitest';
import { generateSampleData } from './dataManager.js';
// import { events as initialEventsData } from './events.js'; // events.js is deleted
import { members as membersListData } from '../data/members.js';

// Helper function to format a Date object to 'YYYY-MM-DD'
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper function to get the first Tuesday of a given year
const getFirstTuesdayOfYear = (year) => {
    const date = new Date(year, 0, 1); // Start with Jan 1st
    while (date.getDay() !== 2) { // 2 represents Tuesday (0 for Sunday, 1 for Monday, ...)
        date.setDate(date.getDate() + 1);
    }
    return date;
};

// Helper function to find the Nth Tuesday of a given month and year
const getNthTuesdayOfMonth = (year, month, n) => {
    const date = new Date(year, month, 1);
    let count = 0;
    while (date.getMonth() === month) {
        if (date.getDay() === 2) { // Tuesday
            count++;
            if (count === n) {
                return date;
            }
        }
        date.setDate(date.getDate() + 1);
        if (date.getMonth() !== month && count < n) return null;
    }
    return null;
};

// Helper function to add days to a date
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Helper function to count Tuesdays in a given date range (inclusive)
const countTuesdaysInRange = (startDate, endDate) => {
    let count = 0;
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
        if (currentDate.getDay() === 2) { // 2 is Tuesday
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
};


describe('generateSampleData', () => {
    const currentYear = new Date().getFullYear();
    const mockInitialEvents = []; // Use empty array as events.js was deleted

    it('Test Case 1: should skip exceptional dates for choir rehearsals', () => {
        const firstTuesdayOfMarch = getNthTuesdayOfMonth(currentYear, 2, 1);
        expect(firstTuesdayOfMarch).not.toBeNull();
        const exceptionalDateStr = formatDate(firstTuesdayOfMarch);

        const exceptionalDates = [exceptionalDateStr];
        const data = generateSampleData(mockInitialEvents, membersListData, exceptionalDates, [], currentYear);
        const skippedRehearsal = data.find(item => item.type === 'chorprobe' && item.date === exceptionalDateStr);
        expect(skippedRehearsal).toBeUndefined();

        const nextTuesday = addDays(firstTuesdayOfMarch, 7);
        const nextRehearsalDateStr = formatDate(nextTuesday);
        const nextRehearsal = data.find(item => item.type === 'chorprobe' && item.date === nextRehearsalDateStr);
        expect(nextRehearsal).toBeDefined();
        expect(nextRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 2: should skip exceptional timespans for choir rehearsals', () => {
        const firstTuesdayOfApril = getNthTuesdayOfMonth(currentYear, 3, 1);
        expect(firstTuesdayOfApril).not.toBeNull();
        const timespanStartStr = formatDate(firstTuesdayOfApril);
        const timespanEnd = addDays(firstTuesdayOfApril, 9);
        const timespanEndStr = formatDate(timespanEnd);

        const exceptionalTimespans = [{ start: timespanStartStr, end: timespanEndStr }];
        const data = generateSampleData(mockInitialEvents, membersListData, [], exceptionalTimespans, currentYear);

        const skippedRehearsal1 = data.find(item => item.type === 'chorprobe' && item.date === timespanStartStr);
        expect(skippedRehearsal1).toBeUndefined();

        const secondTuesdayInTimespanAttempt = addDays(firstTuesdayOfApril, 7);
        if (secondTuesdayInTimespanAttempt <= timespanEnd) {
            const skippedRehearsal2DateStr = formatDate(secondTuesdayInTimespanAttempt);
            const skippedRehearsal2 = data.find(item => item.type === 'chorprobe' && item.date === skippedRehearsal2DateStr);
            expect(skippedRehearsal2).toBeUndefined();
        }

        let nextTuesdayAfterTimespan = new Date(timespanEnd);
        nextTuesdayAfterTimespan.setDate(nextTuesdayAfterTimespan.getDate() + 1);
        while (nextTuesdayAfterTimespan.getDay() !== 2) {
            nextTuesdayAfterTimespan.setDate(nextTuesdayAfterTimespan.getDate() + 1);
        }
        const nextRehearsalDateStr = formatDate(nextTuesdayAfterTimespan);
        const nextRehearsal = data.find(item => item.type === 'chorprobe' && item.date === nextRehearsalDateStr);
        expect(nextRehearsal).toBeDefined();
        expect(nextRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 3: should generate choir rehearsals by default (no exceptions)', () => {
        const data = generateSampleData(mockInitialEvents, membersListData, [], [], currentYear);
        const firstTuesdayOfYearDate = getFirstTuesdayOfYear(currentYear);
        const firstTuesdayDateStr = formatDate(firstTuesdayOfYearDate);
        const firstTuesdayRehearsal = data.find(item => item.type === 'chorprobe' && item.date === firstTuesdayDateStr);
        expect(firstTuesdayRehearsal).toBeDefined();
        expect(firstTuesdayRehearsal.title).toBe('Chorprobe');
    });

    it('Test Case 4: should skip a defined Sommerferien timespan', () => {
        const sommerferienStart = new Date(currentYear, 6, 7); // July 7th
        const sommerferienEnd = new Date(currentYear, 6, 29); // July 29th
        const sommerferienTimespan = [{ start: formatDate(sommerferienStart), end: formatDate(sommerferienEnd) }];
        
        const data = generateSampleData(mockInitialEvents, membersListData, [], sommerferienTimespan, currentYear);

        let currentTestDate = new Date(sommerferienStart);
        while (currentTestDate <= sommerferienEnd) {
            if (currentTestDate.getDay() === 2) {
                const dateStr = formatDate(currentTestDate);
                const skippedRehearsal = data.find(item => item.type === 'chorprobe' && item.date === dateStr);
                expect(skippedRehearsal, `Rehearsal on ${dateStr} should be skipped`).toBeUndefined();
            }
            currentTestDate.setDate(currentTestDate.getDate() + 1);
        }

        const firstTuesdayOfJuly = getNthTuesdayOfMonth(currentYear, 6, 1);
        expect(firstTuesdayOfJuly).not.toBeNull();
        if (firstTuesdayOfJuly < sommerferienStart) {
            const rehearsalBeforeDateStr = formatDate(firstTuesdayOfJuly);
            const rehearsalBeforeVacation = data.find(item => item.type === 'chorprobe' && item.date === rehearsalBeforeDateStr);
            expect(rehearsalBeforeVacation, `Rehearsal on ${rehearsalBeforeDateStr} should exist`).toBeDefined();
        }

        let firstTuesdayAfterSommerferien = new Date(sommerferienEnd);
        firstTuesdayAfterSommerferien.setDate(firstTuesdayAfterSommerferien.getDate() + 1);
        while(firstTuesdayAfterSommerferien.getDay() !== 2) {
            firstTuesdayAfterSommerferien.setDate(firstTuesdayAfterSommerferien.getDate() + 1);
        }
        const rehearsalAfterDateStr = formatDate(firstTuesdayAfterSommerferien);
        const rehearsalAfterVacation = data.find(item => item.type === 'chorprobe' && item.date === rehearsalAfterDateStr);
        expect(rehearsalAfterVacation, `Rehearsal on ${rehearsalAfterDateStr} should exist`).toBeDefined();
    });

    describe('DST and Date Generation Logic Tests', () => {
        // For these tests, allGeneratedData needs to be generated for currentYear
        // And the specific dates need to be calculated for currentYear.
        const allGeneratedData = generateSampleData(mockInitialEvents, membersListData, [], [], currentYear);
        const allChoirProben = allGeneratedData.filter(item => item.type === 'chorprobe');

        it('Test Case 5: Consistent Tuesday Generation Across DST', () => {
            const lastTuesdayMar = getNthTuesdayOfMonth(currentYear, 2, 4) || getNthTuesdayOfMonth(currentYear, 2, 5);
            const firstTuesdayApr = getNthTuesdayOfMonth(currentYear, 3, 1);
            const lastTuesdayOct = getNthTuesdayOfMonth(currentYear, 9, 4) || getNthTuesdayOfMonth(currentYear, 9, 5);
            const firstTuesdayNov = getNthTuesdayOfMonth(currentYear, 10, 1);

            const dstTestDates = [
                lastTuesdayMar ? formatDate(lastTuesdayMar) : null,
                firstTuesdayApr ? formatDate(firstTuesdayApr) : null,
                lastTuesdayOct ? formatDate(lastTuesdayOct) : null,
                firstTuesdayNov ? formatDate(firstTuesdayNov) : null,
            ].filter(Boolean);

            expect(dstTestDates.length).toBeGreaterThanOrEqual(2);

            dstTestDates.forEach(dateStr => {
                const rehearsal = allChoirProben.find(item => item.date === dateStr);
                expect(rehearsal, `Rehearsal on ${dateStr} (around DST) should be defined`).toBeDefined();
                if (rehearsal) expect(rehearsal.title).toBe('Chorprobe');
            });
        });

        it('Test Case 6: No rehearsals on other days (spot check)', () => {
            const date = new Date(currentYear, 2, 1); // March 1st
            while (date.getDay() !== 1) { date.setDate(date.getDate() + 1); } // Find first Monday of March
            const notATuesdayStr = formatDate(date);
            const rehearsal = allChoirProben.find(item => item.date === notATuesdayStr);
            expect(rehearsal).toBeUndefined();
        });

        it(`Test Case 7: Reasonable number of rehearsals in ${currentYear}`, () => {
            let tuesdaysInYear = 0;
            const date = new Date(currentYear, 0, 1);
            while (date.getFullYear() === currentYear) {
                if (date.getDay() === 2) tuesdaysInYear++;
                date.setDate(date.getDate() + 1);
            }
            
            const sommerferienStart = new Date(currentYear, 6, 7); // July 7th
            const sommerferienEnd = new Date(currentYear, 6, 29); // July 29th
            
            const sommerferienTimespan = [{ start: formatDate(sommerferienStart), end: formatDate(sommerferienEnd) }];
            // Generate data specifically for this test's scenario
            const dataWithSommerferien = generateSampleData(mockInitialEvents, membersListData, [], sommerferienTimespan, currentYear);
            const choirProbenWithSommerferien = dataWithSommerferien.filter(item => item.type === 'chorprobe');

            const expectedRehearsals = tuesdaysInYear - countTuesdaysInRange(sommerferienStart, sommerferienEnd);
            
            expect(choirProbenWithSommerferien.length).toBe(expectedRehearsals);
        });
    });
});
