import { describe, it, expect } from 'vitest';
import ScheduleGeneratorService from './ScheduleGeneratorService.js';
import Event from '../entities/Event.js';
import Member from '../entities/Member.js';
import YearlyRawData from '../entities/YearlyRawData.js';
import { members as rawMembersListData } from '../../data/members.json';

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
    while (date.getDay() !== 2) { // 2 represents Tuesday
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

describe('ScheduleGeneratorService', () => {
    const service = new ScheduleGeneratorService();
    const currentYear = new Date().getFullYear();

    // Convert raw members data to Member instances
    const members = rawMembersListData.map(m => new Member(m.name, m.birthday, m.id));
    const emptyMembers = [];

    it('Test Case 1: should skip exceptional dates for choir rehearsals', () => {
        const firstTuesdayOfMarch = getNthTuesdayOfMonth(currentYear, 2, 1); // March
        expect(firstTuesdayOfMarch).not.toBeNull();
        const exceptionalDateStr = formatDate(firstTuesdayOfMarch);

        const yearlyRawData = new YearlyRawData(currentYear, [], [exceptionalDateStr], []);

        const data = service.generateYearlySchedule(yearlyRawData, members, currentYear);

        const skippedRehearsal = data.find(item => item.type === 'chorprobe' && item.date === exceptionalDateStr);
        expect(skippedRehearsal).toBeUndefined();

        const nextTuesday = addDays(firstTuesdayOfMarch, 7);
        const nextRehearsalDateStr = formatDate(nextTuesday);
        const nextRehearsal = data.find(item => item.type === 'chorprobe' && item.date === nextRehearsalDateStr);
        expect(nextRehearsal).toBeInstanceOf(Event);
        if (nextRehearsal) {
            expect(nextRehearsal.title).toBe('Chorprobe');
        }
    });

    it('Test Case 2: should skip exceptional timespans for choir rehearsals', () => {
        const firstTuesdayOfApril = getNthTuesdayOfMonth(currentYear, 3, 1); // April
        expect(firstTuesdayOfApril).not.toBeNull();
        const timespanStartStr = formatDate(firstTuesdayOfApril);
        const timespanEnd = addDays(firstTuesdayOfApril, 9);
        const timespanEndStr = formatDate(timespanEnd);

        const yearlyRawData = new YearlyRawData(currentYear, [], [], [{ start: timespanStartStr, end: timespanEndStr }]);
        const data = service.generateYearlySchedule(yearlyRawData, members, currentYear);

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
        expect(nextRehearsal).toBeInstanceOf(Event);
        if (nextRehearsal) {
            expect(nextRehearsal.title).toBe('Chorprobe');
        }
    });

    it('Test Case 3: should generate choir rehearsals by default (no exceptions)', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [], [], []);
        const data = service.generateYearlySchedule(yearlyRawData, members, currentYear);

        const firstTuesdayOfYearDate = getFirstTuesdayOfYear(currentYear);
        const firstTuesdayDateStr = formatDate(firstTuesdayOfYearDate);
        const firstTuesdayRehearsal = data.find(item => item.type === 'chorprobe' && item.date === firstTuesdayDateStr);
        expect(firstTuesdayRehearsal).toBeInstanceOf(Event);
        if (firstTuesdayRehearsal) {
            expect(firstTuesdayRehearsal.title).toBe('Chorprobe');
        }
    });

    it('Test Case 4: should skip a defined Sommerferien timespan', () => {
        const sommerferienStart = new Date(currentYear, 6, 7); // July 7th (month is 0-indexed)
        const sommerferienEnd = new Date(currentYear, 6, 29); // July 29th
        const sommerferienTimespan = [{ start: formatDate(sommerferienStart), end: formatDate(sommerferienEnd) }];
        
        const yearlyRawData = new YearlyRawData(currentYear, [], [], sommerferienTimespan);
        const data = service.generateYearlySchedule(yearlyRawData, members, currentYear);

        let currentTestDate = new Date(sommerferienStart);
        while (currentTestDate <= sommerferienEnd) {
            if (currentTestDate.getDay() === 2) { // Tuesday
                const dateStr = formatDate(currentTestDate);
                const skippedRehearsal = data.find(item => item.type === 'chorprobe' && item.date === dateStr);
                expect(skippedRehearsal, `Rehearsal on ${dateStr} should be skipped`).toBeUndefined();
            }
            currentTestDate.setDate(currentTestDate.getDate() + 1);
        }

        const firstTuesdayOfJuly = getNthTuesdayOfMonth(currentYear, 6, 1); // July
        expect(firstTuesdayOfJuly).not.toBeNull();
        if (firstTuesdayOfJuly < sommerferienStart) {
            const rehearsalBeforeDateStr = formatDate(firstTuesdayOfJuly);
            const rehearsalBeforeVacation = data.find(item => item.type === 'chorprobe' && item.date === rehearsalBeforeDateStr);
            expect(rehearsalBeforeVacation, `Rehearsal on ${rehearsalBeforeDateStr} should exist`).toBeInstanceOf(Event);
        }

        let firstTuesdayAfterSommerferien = new Date(sommerferienEnd);
        firstTuesdayAfterSommerferien.setDate(firstTuesdayAfterSommerferien.getDate() + 1);
        while(firstTuesdayAfterSommerferien.getDay() !== 2) { // Find next Tuesday
            firstTuesdayAfterSommerferien.setDate(firstTuesdayAfterSommerferien.getDate() + 1);
        }
        const rehearsalAfterDateStr = formatDate(firstTuesdayAfterSommerferien);
        const rehearsalAfterVacation = data.find(item => item.type === 'chorprobe' && item.date === rehearsalAfterDateStr);
        expect(rehearsalAfterVacation, `Rehearsal on ${rehearsalAfterDateStr} should exist`).toBeInstanceOf(Event);
    });

    it('Test Case 10: should not generate choir rehearsal if a manually scheduled event exists on that Tuesday', () => {
        const firstTuesdayOfMay = getNthTuesdayOfMonth(currentYear, 4, 1); // May
        expect(firstTuesdayOfMay).not.toBeNull();
        const conflictingEventDateStr = formatDate(firstTuesdayOfMay);

        const initialEventsData = [{
            id: "manualEvent1",
            title: "Manual Event on a Tuesday",
            date: conflictingEventDateStr,
            startTime: "18:00",
            endTime: "20:00",
            type: "event"
        }];
        const yearlyRawData = new YearlyRawData(currentYear, initialEventsData, [], []);
        const data = service.generateYearlySchedule(yearlyRawData, members, currentYear);

        const conflictingRehearsal = data.find(item => item.type === 'chorprobe' && item.date === conflictingEventDateStr);
        expect(conflictingRehearsal).toBeUndefined();

        const manualEvent = data.find(item => item.id === "manualEvent1");
        expect(manualEvent).toBeInstanceOf(Event);
        expect(manualEvent.title).toBe("Manual Event on a Tuesday");
    });

    it('Test Case 11: should handle empty members list gracefully (no birthday events)', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [], [], []);
        const data = service.generateYearlySchedule(yearlyRawData, emptyMembers, currentYear);
        const birthdayEvents = data.filter(event => event.type === 'geburtstag');
        expect(birthdayEvents.length).toBe(0);
        // Check if choir rehearsals are still generated
        const firstTuesdayRehearsal = data.find(item => item.type === 'chorprobe' && item.date === formatDate(getFirstTuesdayOfYear(currentYear)));
        expect(firstTuesdayRehearsal).toBeInstanceOf(Event);
    });

    it('Test Case 12: all returned items should be instances of Event', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [{
            id: "test-event", title: "Test", date: `${currentYear}-07-01`, startTime: "10:00", endTime: "11:00", type: "event"
        }], [], []);
        const data = service.generateYearlySchedule(yearlyRawData, members, currentYear);
        expect(data.length).toBeGreaterThan(0); // Ensure there's data to check
        data.forEach(item => expect(item).toBeInstanceOf(Event));
    });


    describe('DST and Date Generation Logic Tests', () => {
        const yearlyRawDataDefault = new YearlyRawData(currentYear, [], [], []);
        const allGeneratedData = service.generateYearlySchedule(yearlyRawDataDefault, members, currentYear);
        const allChoirProben = allGeneratedData.filter(item => item.type === 'chorprobe');

        it('Test Case 5: Consistent Tuesday Generation Across DST', () => {
            const lastTuesdayMar = getNthTuesdayOfMonth(currentYear, 2, 4) || getNthTuesdayOfMonth(currentYear, 2, 5); // March
            const firstTuesdayApr = getNthTuesdayOfMonth(currentYear, 3, 1); // April
            const lastTuesdayOct = getNthTuesdayOfMonth(currentYear, 9, 4) || getNthTuesdayOfMonth(currentYear, 9, 5); // October
            const firstTuesdayNov = getNthTuesdayOfMonth(currentYear, 10, 1); // November

            const dstTestDates = [
                lastTuesdayMar ? formatDate(lastTuesdayMar) : null,
                firstTuesdayApr ? formatDate(firstTuesdayApr) : null,
                lastTuesdayOct ? formatDate(lastTuesdayOct) : null,
                firstTuesdayNov ? formatDate(firstTuesdayNov) : null,
            ].filter(Boolean); // Remove nulls if a month doesn't have that many Tuesdays

            expect(dstTestDates.length).toBeGreaterThanOrEqual(2); // Ensure we have dates to test

            dstTestDates.forEach(dateStr => {
                const rehearsal = allChoirProben.find(item => item.date === dateStr);
                expect(rehearsal, `Rehearsal on ${dateStr} (around DST) should be defined`).toBeInstanceOf(Event);
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
            const yearlyRawDataWithSommerferien = new YearlyRawData(currentYear, [], [], sommerferienTimespan);
            const dataWithSommerferien = service.generateYearlySchedule(yearlyRawDataWithSommerferien, members, currentYear);
            const choirProbenWithSommerferien = dataWithSommerferien.filter(item => item.type === 'chorprobe');

            const expectedRehearsals = tuesdaysInYear - countTuesdaysInRange(sommerferienStart, sommerferienEnd);
            
            expect(choirProbenWithSommerferien.length).toBe(expectedRehearsals);
        });

        it('Test Case 8: Birthday events are generated correctly', () => {
            const yearlyRawData = new YearlyRawData(currentYear, [], [], []);
            const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear);
            const birthdayEvents = schedule.filter(event => event.type === 'geburtstag');

            expect(birthdayEvents.length).toBe(members.length);
            members.forEach(member => {
                const memberBirthMonthDay = member.getBirthMonthDay();
                const expectedBirthdayDate = `${currentYear}-${memberBirthMonthDay}`;
                const eventForMember = birthdayEvents.find(event => event.memberName === member.name && event.date === expectedBirthdayDate);
                expect(eventForMember).toBeInstanceOf(Event);
                if(eventForMember) {
                    expect(eventForMember.title).toBe(`Geburtstag ${member.name}`);
                }
            });
        });

        it('Test Case 9: Initial events are included and are Event instances', () => {
            const rawInitialEvent = {
                id: "initEvent1",
                title: "Initial Test Event",
                date: `${currentYear}-01-15`,
                startTime: "10:00",
                endTime: "11:00",
                type: "event",
                description: "A predefined event."
            };
            const yearlyRawDataWithInitial = new YearlyRawData(currentYear, [rawInitialEvent], [], []);
            const schedule = service.generateYearlySchedule(yearlyRawDataWithInitial, members, currentYear);

            const initialEventInSchedule = schedule.find(event => event.id === "initEvent1");
            expect(initialEventInSchedule).toBeInstanceOf(Event);
            if (initialEventInSchedule) {
                expect(initialEventInSchedule.title).toBe("Initial Test Event");
                expect(initialEventInSchedule.description).toBe("A predefined event.");
            }
        });

    });
});
