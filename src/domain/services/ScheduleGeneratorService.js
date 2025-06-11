import Event from '../entities/Event.js';
import Member from '../entities/Member.js'; // Assuming Member entity is used for membersData
import YearlyRawData from '../entities/YearlyRawData.js'; // Assuming YearlyRawData is used for initial event data and exceptions

class ScheduleGeneratorService {
    /**
     * Generates a yearly schedule of events.
     * @param {YearlyRawData} yearlyRawData - An instance of YearlyRawData containing initial events, exceptional dates, and timespans.
     * @param {Member[]} members - An array of Member instances.
     * @param {number} targetYear - The specific year for which to generate the schedule.
     * @param {Object[]} [rehearsalConfigs=[]] - An array of rehearsal configuration objects.
     * @returns {Event[]} An array of Event entity instances, sorted by date.
     */
    generateYearlySchedule(yearlyRawData, members, targetYear, rehearsalConfigs = []) {
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
        if (!Array.isArray(rehearsalConfigs)) {
            console.warn("generateYearlySchedule: rehearsalConfigs is not an array. Skipping rehearsal generation.");
            rehearsalConfigs = []; // Ensure it's an array to prevent errors later
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

        const generatedRehearsals = [];
        const exceptionalDates = yearlyRawData.exceptionalDates || [];
        const exceptionalTimespans = yearlyRawData.exceptionalTimespans || [];
        const initialEventDates = initialEvents.map(e => e.date); // For quick lookup if needed, though not explicitly used in provided logic for rehearsal collision

        rehearsalConfigs.forEach(config => {
            // Basic validation for a single config item
            if (!config || typeof config.dayOfWeek !== 'number' || !config.startTime || !config.endTime || !config.id || !config.title) {
                console.warn(`Skipping invalid rehearsal config: ${JSON.stringify(config)}`);
                return;
            }
            
            let currentDate = new Date(yearToProcess, 0, 1); // Start at Jan 1st of the target year
            
            // Find the first occurrence of config.dayOfWeek
            while (currentDate.getDay() !== config.dayOfWeek) {
                currentDate.setDate(currentDate.getDate() + 1);
                // Ensure we don't overshoot into the next year during this initial search
                if (currentDate.getFullYear() !== yearToProcess) {
                    return; // This dayOfWeek doesn't occur in this year starting from Jan 1st.
                }
            }

            const lastDateOfYear = new Date(yearToProcess, 11, 31);

            while (currentDate <= lastDateOfYear && currentDate.getFullYear() === yearToProcess) {
                const year = currentDate.getFullYear();
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                const day = currentDate.getDate().toString().padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                // Check for exceptions
                const isExceptionalDate = exceptionalDates.includes(dateStr);
                
                // Create a date object for the current rehearsal's date part only for timespan check
                const currentRehearsalDateOnly = new Date(year, currentDate.getMonth(), day);
                const isInExceptionalTimespan = exceptionalTimespans.some(span => {
                    // Ensure span.start and span.end are valid date strings before creating Date objects
                    if (!span || !span.start || !span.end) return false;
                    const spanStart = new Date(span.start);
                    const spanEnd = new Date(span.end);
                    // Normalize spanStart and spanEnd to ignore time components for date-only comparison
                    spanStart.setHours(0,0,0,0);
                    spanEnd.setHours(0,0,0,0);
                    return currentRehearsalDateOnly >= spanStart && currentRehearsalDateOnly <= spanEnd;
                });

                if (!isExceptionalDate && !isInExceptionalTimespan) {
                    generatedRehearsals.push(new Event(
                        `cfg-${config.id}-${dateStr}`,
                        config.title,
                        dateStr,
                        config.startTime,
                        config.endTime,
                        `chorprobe`, // Event type based on config id
                        config.description || '', // Default to empty string if no description
                        config.defaultLocation || '' // Default to empty string if no location
                    ));
                }
                currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
            }
        });

        return [...initialEvents, ...birthdays, ...generatedRehearsals].sort((a, b) => {
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
