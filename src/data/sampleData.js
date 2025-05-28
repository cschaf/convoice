export const generateSampleData = (initialEvents = [], membersData = [], exceptionalDates = [], exceptionalTimespans = []) => {
    const currentYear = new Date().getFullYear(); // Get current year

    const birthdays = membersData.map((member, index) => ({
        id: `b${index + 1}`,
        title: `Geburtstag ${member.name}`,
        date: `${currentYear}-${member.birthday.slice(5)}`, // Use current year
        type: 'geburtstag',
        memberName: member.name,
        description: `🎉 ${member.name} hat Geburtstag!`
    }));

    // Chorproben generieren (jeden Dienstag, außer bei Event-Konflikten)
    const chorproben = [];
    const endDate = new Date(currentYear, 11, 31); // December 31st of current year
    const eventDates = initialEvents.map(e => e.date);

    // Calculate the first Tuesday of the current year
    let currentDate = new Date(currentYear, 0, 1, 19, 0, 0); // Start with Jan 1st, 19:00 of current year
    while (currentDate.getDay() !== 2) { // 0 = Sunday, 1 = Monday, 2 = Tuesday
        currentDate.setDate(currentDate.getDate() + 1);
    }
    // Now currentDate is the first Tuesday of currentYear at 19:00

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
