export const generateSampleData = () => {
    const events = [
        {
            id: 'e1',
            title: 'Sommerfest Christus',
            date: '2025-06-28',
            startTime: '15:00',
            endTime: '18:00',
            type: 'event',
            description: 'Auftritt beim Gemeinde-Sommerfest',
            location: 'Christus-Gemeinde'
        },
        {
            id: 'e2',
            title: 'Gottesdienst Huchting',
            date: '2025-04-20',
            startTime: '06:00',
            endTime: '08:00',
            type: 'event',
            description: 'Ostersonntag Gottesdienst mit anschließendem Frühstück',
            location: 'Huchting'
        },
        {
            id: 'e3',
            title: 'Rudelsingen Woltmershausen',
            date: '2025-05-18',
            startTime: '17:00',
            endTime: '19:00',
            type: 'event',
            description: 'Gemeinsames Singen mit anderen Chören',
            location: 'Woltmershausen'
        },
        {
            id: 'e4',
            title: 'Gottesdienst mit Grillen',
            date: '2025-08-31',
            startTime: '18:00',
            endTime: '21:00',
            type: 'event',
            description: 'Abendgottesdienst mit anschließendem Grillen',
            location: 'Huchting'
        },
        {
            id: 'e5',
            title: 'Weihnachtskonzert',
            date: '2025-12-15',
            startTime: '19:00',
            endTime: '21:00',
            type: 'event',
            description: 'Traditionelles Weihnachtskonzert der ConVoice',
            location: 'Stadthalle Bremen'
        }
    ];

    const members = [
        { name: 'Manuela', birthday: '1984-01-15' },
        { name: 'Thomas', birthday: '1978-03-22' },
        { name: 'Sarah', birthday: '1990-07-08' },
        { name: 'Michael', birthday: '1985-11-12' },
        { name: 'Anna', birthday: '1992-05-28' },
        { name: 'David', birthday: '1987-09-14' },
        { name: 'Lisa', birthday: '1989-02-03' },
        { name: 'Mark', birthday: '1983-10-30' },
        { name: 'Julia', birthday: '1991-06-17' },
        { name: 'Stefan', birthday: '1979-12-05' }
    ];

    const birthdays = members.map((member, index) => ({
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
    const eventDates = events.map(e => e.date);

    // Ausnahmen für Sommerferien
    const vacationStart = new Date('2025-07-07');
    const vacationEnd = new Date('2025-07-29');

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        if (date.getDay() === 2) { // Dienstag
            const dateStr = date.toISOString().split('T')[0];
            const isVacation = date >= vacationStart && date <= vacationEnd;
            const hasEvent = eventDates.includes(dateStr);

            if (!hasEvent && !isVacation) {
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

    return [...events, ...birthdays, ...chorproben].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );
};
