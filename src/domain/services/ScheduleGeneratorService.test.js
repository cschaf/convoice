import { describe, it, expect } from 'vitest';
import ScheduleGeneratorService from './ScheduleGeneratorService.js';
import Event from '../entities/Event.js';
import Member from '../entities/Member.js';
import YearlyRawData from '../entities/YearlyRawData.js';
import rawMembersListData from '../../data/members.json';

// Helper function to format a Date object to 'YYYY-MM-DD'
const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        // console.warn(`formatDate received invalid date: ${date}`);
        return null;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to get the Nth specific weekday of a month
// dayOfWeek: 0 for Sunday, 1 for Monday, ..., 6 for Saturday
const getNthWeekdayOfMonth = (year, month, dayOfWeek, n) => {
    const date = new Date(year, month, 1);
    let count = 0;
    while (date.getMonth() === month) {
        if (date.getDay() === dayOfWeek) {
            count++;
            if (count === n) {
                return new Date(date.getTime()); // Return a new Date object
            }
        }
        date.setDate(date.getDate() + 1);
    }
    return null; // Weekday not found N times
};


// Helper function to add days to a date
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Sample Rehearsal Configurations
const sampleRehearsalConfigs = [
    {
        id: 'chorprobe', title: 'Chorprobe', dayOfWeek: 2, // Tuesday
        startTime: '19:00', endTime: '20:30', frequency: 'weekly',
        defaultLocation: 'Gemeindehaus Woltershausen', description: 'Wöchentliche Chorprobe'
    },
    {
        id: 'generalprobe', title: 'Generalprobe', dayOfWeek: 4, // Thursday
        startTime: '18:00', endTime: '21:00', frequency: 'weekly',
        defaultLocation: 'Kirche St. Marien', description: 'Intensive Generalprobe'
    }
];

const singleTuesdayRehearsalConfig = [sampleRehearsalConfigs[0]];
const singleThursdayRehearsalConfig = [sampleRehearsalConfigs[1]];


describe('ScheduleGeneratorService', () => {
    const service = new ScheduleGeneratorService();
    const currentYear = new Date().getFullYear(); // Use a fixed year for consistent test results
    // const currentYear = 2024; // Or a fixed year

    const members = rawMembersListData.map(m => new Member(m.name, m.birthday, m.id));
    const emptyMembers = [];

    it('should generate only birthdays and initial events if rehearsalConfigs is empty', () => {
        const initialEvent = { id: 'evt1', title: 'Initial Event', date: `${currentYear}-03-15`, startTime: '10:00', endTime: '11:00', type: 'event' };
        const yearlyRawData = new YearlyRawData(currentYear, [initialEvent], [], []);
        const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear, []);
        
        expect(schedule.length).toBe(members.length + 1);
        expect(schedule.find(e => e.id === 'evt1')).toBeDefined();
        members.forEach(member => {
            expect(schedule.some(e => e.type === 'geburtstag' && e.memberName === member.name)).toBe(true);
        });
        expect(schedule.every(e => e.type !== `rehearsal-${singleTuesdayRehearsalConfig[0].id}`)).toBe(true);
    });

    it('should generate events for a single weekly rehearsal config', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [], [], []);
        // Calculate expected Tuesdays (excluding none for this simple test)
        let expectedTuesdays = 0;
        const date = new Date(currentYear, 0, 1);
        while(date.getFullYear() === currentYear) {
            if (date.getDay() === 2) expectedTuesdays++;
            date.setDate(date.getDate() + 1);
        }

        const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear, singleTuesdayRehearsalConfig);
        const rehearsals = schedule.filter(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}`);
        
        expect(rehearsals.length).toBe(expectedTuesdays);
        rehearsals.forEach(rehearsal => {
            expect(rehearsal.title).toBe(singleTuesdayRehearsalConfig[0].title);
            expect(new Date(rehearsal.date).getDay()).toBe(singleTuesdayRehearsalConfig[0].dayOfWeek);
            expect(rehearsal.startTime).toBe(singleTuesdayRehearsalConfig[0].startTime);
            expect(rehearsal.location).toBe(singleTuesdayRehearsalConfig[0].defaultLocation);
            expect(rehearsal.id.startsWith(`cfg-${singleTuesdayRehearsalConfig[0].id}-`)).toBe(true);
        });
    });

    it('should generate events for multiple weekly rehearsal configs', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [], [], []);
        const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear, sampleRehearsalConfigs);

        const tuesdayRehearsals = schedule.filter(e => e.type === `rehearsal-${sampleRehearsalConfigs[0].id}`);
        const thursdayRehearsals = schedule.filter(e => e.type === `rehearsal-${sampleRehearsalConfigs[1].id}`);

        let expectedTuesdays = 0;
        let expectedThursdays = 0;
        const date = new Date(currentYear, 0, 1);
        while(date.getFullYear() === currentYear) {
            if (date.getDay() === 2) expectedTuesdays++;
            if (date.getDay() === 4) expectedThursdays++;
            date.setDate(date.getDate() + 1);
        }
        expect(tuesdayRehearsals.length).toBe(expectedTuesdays);
        expect(thursdayRehearsals.length).toBe(expectedThursdays);

        tuesdayRehearsals.forEach(rehearsal => expect(new Date(rehearsal.date).getDay()).toBe(2));
        thursdayRehearsals.forEach(rehearsal => expect(new Date(rehearsal.date).getDay()).toBe(4));
    });

    it('should skip exceptional dates for configured rehearsals', () => {
        const firstTuesday = getNthWeekdayOfMonth(currentYear, 2, 2, 1); // 1st Tuesday of March
        expect(firstTuesday).not.toBeNull();
        const exceptionalDateStr = formatDate(firstTuesday);
        
        const yearlyRawData = new YearlyRawData(currentYear, [], [exceptionalDateStr], []);
        const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear, singleTuesdayRehearsalConfig);
        
        const skippedRehearsal = schedule.find(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}` && e.date === exceptionalDateStr);
        expect(skippedRehearsal).toBeUndefined();

        const nextTuesday = addDays(firstTuesday, 7);
        const nextRehearsal = schedule.find(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}` && e.date === formatDate(nextTuesday));
        expect(nextRehearsal).toBeDefined();
    });

    it('should skip exceptional timespans for configured rehearsals', () => {
        const firstTuesdayApril = getNthWeekdayOfMonth(currentYear, 3, 2, 1); // 1st Tuesday of April
        expect(firstTuesdayApril).not.toBeNull();

        const timespanStartStr = formatDate(firstTuesdayApril);
        const timespanEnd = addDays(firstTuesdayApril, 9); // Timespan of 10 days, covering two Tuesdays
        const timespanEndStr = formatDate(timespanEnd);

        const yearlyRawData = new YearlyRawData(currentYear, [], [], [{ start: timespanStartStr, end: timespanEndStr, description: "Test Span" }]);
        const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear, singleTuesdayRehearsalConfig);

        // First Tuesday in span
        const skippedRehearsal1 = schedule.find(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}` && e.date === timespanStartStr);
        expect(skippedRehearsal1).toBeUndefined();
        
        // Second Tuesday in span
        const secondTuesdayInSpan = addDays(firstTuesdayApril, 7);
        if (secondTuesdayInSpan <= timespanEnd) {
            const skippedRehearsal2 = schedule.find(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}` && e.date === formatDate(secondTuesdayInSpan));
            expect(skippedRehearsal2).toBeUndefined();
        }

        let nextTuesdayAfterTimespan = new Date(timespanEnd);
        nextTuesdayAfterTimespan.setDate(nextTuesdayAfterTimespan.getDate() + 1);
        while(nextTuesdayAfterTimespan.getDay() !== 2) {
            nextTuesdayAfterTimespan.setDate(nextTuesdayAfterTimespan.getDate() + 1);
        }
        const nextRehearsal = schedule.find(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}` && e.date === formatDate(nextTuesdayAfterTimespan));
        expect(nextRehearsal).toBeDefined();
    });
    
    it('should correctly sort initial events, birthdays, and configured rehearsals', () => {
        const initialEvent = { id: 'evtEarly', title: 'Early Event', date: `${currentYear}-01-05`, startTime: '09:00', endTime: '10:00', type: 'event' };
        // Birthday for a member that falls after the first rehearsal but before a later one
        const testMemberBirthday = `${currentYear}-01-10`; 
        const testMember = new Member("Test Person", testMemberBirthday.replace(`${currentYear}-`, ''), "tm1");
        
        // A rehearsal config for Mondays (to ensure it's different from initial event day)
        const mondayRehearsalConfig = [{
            id: 'mondaySing', title: 'Monday Singalong', dayOfWeek: 1, // Monday
            startTime: '17:00', endTime: '18:00', frequency: 'weekly', defaultLocation: 'Music Room'
        }];

        const yearlyRawData = new YearlyRawData(currentYear, [initialEvent], [], []);
        const schedule = service.generateYearlySchedule(yearlyRawData, [testMember], currentYear, mondayRehearsalConfig);
        
        // Find first Monday rehearsal
        let firstMonday = new Date(currentYear, 0, 1);
        while(firstMonday.getDay() !== 1) firstMonday.setDate(firstMonday.getDate() + 1);
        const firstMondayDateStr = formatDate(firstMonday);

        // Expected order:
        // 1. Early Event (Jan 5th)
        // 2. First Monday Rehearsal (e.g. Jan 6th if Jan 1st is Sunday)
        // 3. Test Member Birthday (Jan 10th)

        expect(schedule.length).toBeGreaterThan(3); // At least initial, 1 birthday, multiple rehearsals

        const earlyEventIdx = schedule.findIndex(e => e.id === 'evtEarly');
        const firstRehearsalIdx = schedule.findIndex(e => e.type === `rehearsal-${mondayRehearsalConfig[0].id}` && e.date === firstMondayDateStr);
        const birthdayIdx = schedule.findIndex(e => e.type === 'geburtstag' && e.date === testMemberBirthday);

        expect(earlyEventIdx).not.toBe(-1);
        expect(firstRehearsalIdx).not.toBe(-1);
        expect(birthdayIdx).not.toBe(-1);

        // Check sorting
        for (let i = 0; i < schedule.length - 1; i++) {
            const d1 = new Date(schedule[i].date + 'T' + schedule[i].startTime);
            const d2 = new Date(schedule[i+1].date + 'T' + schedule[i+1].startTime);
            expect(d1.getTime()).toBeLessThanOrEqual(d2.getTime());
        }
        
        // More specific order checks if needed, e.g. earlyEventIdx < firstRehearsalIdx < birthdayIdx
        // This depends on the exact date of the first Monday.
        // A simpler check is that all events are sorted, which is done above.
    });

    it('should generate rehearsals correctly when yearlyRawData fields are empty', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [], [], []); // All empty
        const schedule = service.generateYearlySchedule(yearlyRawData, emptyMembers, currentYear, singleTuesdayRehearsalConfig);
        
        let expectedTuesdays = 0;
        const date = new Date(currentYear, 0, 1);
        while(date.getFullYear() === currentYear) {
            if (date.getDay() === 2) expectedTuesdays++;
            date.setDate(date.getDate() + 1);
        }
        
        const rehearsals = schedule.filter(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}`);
        expect(rehearsals.length).toBe(expectedTuesdays);
        expect(schedule.filter(e => e.type === 'geburtstag').length).toBe(0); // No members
        expect(schedule.filter(e => e.type === 'event').length).toBe(0); // No initial events
    });
    
    it('all returned items should be instances of Event', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [{
            id: "test-event", title: "Test", date: `${currentYear}-07-01`, startTime: "10:00", endTime: "11:00", type: "event"
        }], [], []);
        const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear, singleTuesdayRehearsalConfig);
        expect(schedule.length).toBeGreaterThan(0);
        schedule.forEach(item => expect(item).toBeInstanceOf(Event));
    });
    
    it('should handle empty members list gracefully (no birthday events, but rehearsals generated)', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [], [], []);
        const schedule = service.generateYearlySchedule(yearlyRawData, emptyMembers, currentYear, singleTuesdayRehearsalConfig);
        const birthdayEvents = schedule.filter(event => event.type === 'geburtstag');
        expect(birthdayEvents.length).toBe(0);
        
        const rehearsals = schedule.filter(e => e.type === `rehearsal-${singleTuesdayRehearsalConfig[0].id}`);
        expect(rehearsals.length).toBeGreaterThan(0); // Rehearsals should still be generated
    });

    it('Birthday events are generated correctly', () => {
        const yearlyRawData = new YearlyRawData(currentYear, [], [], []);
        const schedule = service.generateYearlySchedule(yearlyRawData, members, currentYear, []); // No rehearsals for this test
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

    it('Initial events are included and are Event instances', () => {
        const rawInitialEvent = {
            id: "initEvent1", title: "Initial Test Event", date: `${currentYear}-01-15`,
            startTime: "10:00", endTime: "11:00", type: "event", description: "A predefined event."
        };
        const yearlyRawDataWithInitial = new YearlyRawData(currentYear, [rawInitialEvent], [], []);
        const schedule = service.generateYearlySchedule(yearlyRawDataWithInitial, members, currentYear, []);

        const initialEventInSchedule = schedule.find(event => event.id === "initEvent1");
        expect(initialEventInSchedule).toBeInstanceOf(Event);
        if (initialEventInSchedule) {
            expect(initialEventInSchedule.title).toBe("Initial Test Event");
            expect(initialEventInSchedule.description).toBe("A predefined event.");
        }
    });

    // Remove old DST and other Tuesday-specific tests if they are now redundant or misleading
    // The new tests for specific configurations should cover date generation logic.
    // For example, `test('Consistent Tuesday Generation Across DST')` can be removed if new tests cover it implicitly.
});
