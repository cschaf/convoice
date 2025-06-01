import Event from '../entities/Event.js';
import Member from '../entities/Member.js'; // Assuming Member entity is used for membersData
import YearlyRawData from '../entities/YearlyRawData.js'; // Assuming YearlyRawData is used for initial event data and exceptions

class ScheduleGeneratorService {
    /**
     * Generates a yearly schedule of events.
     * @param {YearlyRawData} yearlyRawData - An instance of YearlyRawData containing initial events, exceptional dates, and timespans.
     * @param {Member[]} members - An array of Member instances.
     * @param {number} targetYear - The specific year for which to generate the schedule.
     * @returns {Event[]} An array of Event entity instances, sorted by date.
     */
    generateYearlySchedule(yearlyRawData, members, targetYear) {
        if (!(yearlyRawData instanceof YearlyRawData)) {
            console.warn("generateYearlySchedule: yearlyRawData is not an instance of YearlyRawData. Ensure data is structured correctly.");
            // Potentially transform plain object to YearlyRawData instance here if desired
        }
        if (!Array.isArray(members) || !members.every(m => m instanceof Member)) {
            console.warn("generateYearlySchedule: members is not an array of Member instances. Ensure data is structured correctly.");
            // Potentially transform plain objects to Member instances here
        }
        if (typeof targetYear !== 'number') {
            throw new Error("Target year must be a number.");
        }

        const yearToProcess = targetYear;

        // Process initial events from yearlyRawData
        const initialEvents = yearlyRawData.events.map(eventData =>
            new Event(
                eventData.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                eventData.title,
                eventData.date,
                eventData.startTime,
                eventData.endTime,
                eventData.type || 'event', // Default type if not specified
                eventData.description,
                eventData.location
            )
        );

        const birthdays = members.map((member, index) => {
            // Ensure member is an instance of Member for safety, if not already guaranteed
            const memberBirthday = member instanceof Member ? member.getBirthMonthDay() : member.birthday.slice(5); // MM-DD
            return new Event(
                `b${index + 1}-${yearToProcess}-${member.name.replace(/\s+/g, '')}`,
                `Geburtstag ${member.name}`,
                `${yearToProcess}-${memberBirthday}`,
                '00:00', // All-day event or specific time
                '23:59',
                'geburtstag',
                `🎉 ${member.name} hat Geburtstag!`,
                '',
                member.name
            );
        });

        const chorproben = [];
        // Use exceptional dates and timespans from yearlyRawData
        const exceptionalDates = yearlyRawData.exceptionalDates;
        const exceptionalTimespans = yearlyRawData.exceptionalTimespans;

        const eventDates = initialEvents.map(e => e.date); // Dates of manually scheduled events

        let currentDate = new Date(yearToProcess, 0, 1, 19, 0, 0); // Start with Jan 1st of yearToProcess
        while (currentDate.getDay() !== 2) { // 0 = Sunday, ..., 2 = Tuesday
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const lastDateOfYear = new Date(yearToProcess, 11, 31);

        while (currentDate <= lastDateOfYear) {
            const year = currentDate.getFullYear();
            // Ensure we are still in the target year, especially if loop continues slightly past due to date manipulations
            if (year !== yearToProcess) {
                currentDate.setDate(currentDate.getDate() + 7);
                continue;
            }

            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = currentDate.getDate().toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const hasManuallyScheduledEvent = eventDates.includes(dateStr);
            const isExceptionalDate = exceptionalDates.includes(dateStr);

            const currentCheckDateForTimespan = new Date(year, currentDate.getMonth(), day); // Date object for comparison
            const isInExceptionalTimespan = exceptionalTimespans.some(span => {
                const spanStart = new Date(span.start);
                const spanEnd = new Date(span.end);
                return currentCheckDateForTimespan >= spanStart && currentCheckDateForTimespan <= spanEnd;
            });

            if (!hasManuallyScheduledEvent && !isExceptionalDate && !isInExceptionalTimespan) {
                chorproben.push(new Event(
                    `p-${dateStr}`,
                    'Chorprobe',
                    dateStr,
                    '19:00',
                    '20:30',
                    'chorprobe',
                    'Wöchentliche Chorprobe',
                    'Gemeindehaus Woltershausen'
                ));
            }

            currentDate.setDate(currentDate.getDate() + 7);
        }

        return [...initialEvents, ...birthdays, ...chorproben].sort((a, b) => {
            // Sort by date, then by start time
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) {
                return dateComparison;
            }
            // If dates are same, compare by start time (optional, but good for consistency)
            if (a.startTime && b.startTime) {
                return a.startTime.localeCompare(b.startTime);
            }
            return 0; // Should not happen if startTime is always present
        });
    }
}

export default ScheduleGeneratorService;
