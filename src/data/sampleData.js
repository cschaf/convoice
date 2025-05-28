export const generateSampleData = (initialEvents = [], membersData = [], exceptionalDates = [], exceptionalTimespans = []) => {
    const birthdays = membersData.map((member, index) => ({
        id: `b${index + 1}`,
        title: `Geburtstag ${member.name}`,
        date: `2025-${member.birthday.slice(5)}`,
        type: 'geburtstag',
        memberName: member.name,
        description: `🎉 ${member.name} feiert Geburtstag!`
    }));

    // Chorproben generieren (jeden Dienstag, außer bei Event-Konflikten)
    const chorproben = [];
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    const eventDates = initialEvents.map(e => e.date);

    // Add default Sommerferien to the provided exceptionalTimespans
    // Note: This modifies the exceptionalTimespans array passed as a parameter.
    // If a new array is desired, exceptionalTimespans should be cloned first.
    const sommerferien = { start: '2025-07-07', end: '2025-07-29' };
    if (!exceptionalTimespans.some(t => t.start === sommerferien.start && t.end === sommerferien.end)) {
        exceptionalTimespans.push(sommerferien);
    }

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        if (date.getDay() === 2) { // Dienstag
            const dateStr = date.toISOString().split('T')[0];
            const hasEvent = eventDates.includes(dateStr);
            const isExceptionalDate = exceptionalDates.includes(dateStr);
            const inExceptionalTimespan = exceptionalTimespans.some(timespan => {
                const currentDate = new Date(dateStr);
                const timespanStart = new Date(timespan.start);
                const timespanEnd = new Date(timespan.end);
                return currentDate >= timespanStart && currentDate <= timespanEnd;
            });

            if (!hasEvent && !isExceptionalDate && !inExceptionalTimespan) {
                chorproben.push({
                    id: `p${dateStr}`,
                    title: 'Chorprobe',
                    date: dateStr,
                    startTime: '19:00',
                    endTime: '20:30',
                    type: 'chorprobe',
                    description: 'Wöchentliche Chorprobe',
                    location: 'Gemeindehaus Woltershausen'
                });
            }
        }
    }

    return [...initialEvents, ...birthdays, ...chorproben].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );
};
