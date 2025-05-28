export const generateSampleData = (initialEvents = [], membersData = [], exceptionalDates = [], exceptionalTimespans = []) => {
    const birthdays = membersData.map((member, index) => ({
        id: `b${index + 1}`,
        title: `Geburtstag ${member.name}`,
        date: `2025-${member.birthday.slice(5)}`,
        type: 'geburtstag',
        memberName: member.name,
        description: `🎉 ${member.name} hat Geburtstag!`
    }));

    // Chorproben generieren (jeden Dienstag, außer bei Event-Konflikten)
    const chorproben = [];
    const endDate = new Date('2025-12-31'); // Ensure endDate is defined
    const eventDates = initialEvents.map(e => e.date);
    let currentDate = new Date(2025, 0, 7, 19, 0, 0); // First Tuesday of 2025, 19:00 (Jan 7, 2025)
    const lastDateOfYear = new Date(endDate.getFullYear(), 11, 31); // December 31st of the target year

    while (currentDate <= lastDateOfYear) {
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const hasEvent = eventDates.includes(dateStr);
        const isExceptionalDate = exceptionalDates.includes(dateStr);
        const isInExceptionalTimespan = exceptionalTimespans.some(span => {
            const spanStart = new Date(span.start);
            const spanEnd = new Date(span.end);
            // Create a Date object for dateStr at midnight for comparison to avoid time-of-day issues with timespan checks
            const currentCheckDate = new Date(year, currentDate.getMonth(), day);
            return currentCheckDate >= spanStart && currentCheckDate <= spanEnd;
        });

        if (!hasEvent && !isExceptionalDate && !isInExceptionalTimespan) {
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

        // Increment currentDate by 7 days
        currentDate.setDate(currentDate.getDate() + 7);
    }

    return [...initialEvents, ...birthdays, ...chorproben].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );
};
