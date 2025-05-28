export const generateSampleData = () => {
    const events = [
        {
            id: 'e1',
            title: 'Probe',
            date: '2025-03-01',
            startTime: '10:00',
            endTime: '14:00',
            type: 'event',
            description: 'Extra Probe',
            location: 'Huchting'
        },
        {
            id: 'e2',
            title: 'Ostergottesdienst',
            date: '2025-04-20',
            startTime: '06:00',
            endTime: '07:00',
            type: 'event',
            description: 'Auftritt + Frühstück',
            location: 'Huchting'
        },
        {
            id: 'e3',
            title: 'Offenes Singen',
            date: '2025-05-18',
            startTime: '17:00',
            endTime: '20:00',
            type: 'event',
            description: 'Gemeinsames Singen',
            location: 'Christuskirche Woltmershausen'
        },
        {
            id: 'e4',
            title: 'Sommerfest Christus',
            date: '2025-06-28',
            startTime: '15:00',
            endTime: '18:00',
            type: 'event',
            description: 'Auftritt beim Gemeinde-Sommerfest',
            location: 'Christus-Gemeinde'
        },
        {
            id: 'e5',
            title: 'Gottesdienst mit Grillen',
            date: '2025-08-31',
            startTime: '18:00',
            endTime: '21:00',
            type: 'event',
            description: 'Abendgottesdienst mit anschließendem Grillen',
            location: 'Huchting'
        }

    ];

    const members = [
        { name: 'Manuela', birthday: '1900-10-10' },
        { name: 'Christian', birthday: '1990-11-25' },
        { name: 'Petra', birthday: '1900-02-17' },
        { name: 'Sonja', birthday: '1900-03-19' },
        { name: 'Helga', birthday: '1900-05-25' },
        { name: 'Jutta', birthday: '1900-09-14' },
        { name: 'Heike', birthday: '1900-07-18' },
        { name: 'Bobby', birthday: '1900-06-03' },
        { name: 'Christa', birthday: '1900-06-17' },
        { name: 'Astrid', birthday: '1900-07-18' },
        { name: 'Rita', birthday: '1900-09-02' },
        { name: 'Elisabeth', birthday: '1900-06-19' },
        { name: 'Udo', birthday: '1900-07-30' },
        { name: 'Ingo', birthday: '1900-11-08' },
        { name: 'Monika', birthday: '1900-09-15' }
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
