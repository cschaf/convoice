export const downloadICS = (termin) => {
    const formatDateForICS = (dateStr, timeStr = null) => {
        const date = new Date(dateStr + (timeStr ? `T${timeStr}:00` : 'T00:00:00'));
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeText = (text) => {
        if (!text) return '';
        return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    const startDateTime = formatDateForICS(termin.date, termin.startTime);
    const endDateTime = formatDateForICS(termin.date, termin.endTime || termin.startTime);
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ConVoice Chor//Terminverwaltung//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${termin.id}@convoice-chor.de`,
        `DTSTAMP:${now}`,
        `DTSTART:${startDateTime}`,
        `DTEND:${endDateTime}`,
        `SUMMARY:${escapeText(termin.title)}`,
        `DESCRIPTION:${escapeText(termin.description || '')}`,
        termin.location ? `LOCATION:${escapeText(termin.location)}` : '',
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Erinnerung: ${escapeText(termin.title)}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${termin.title.replace(/[^a-zA-Z0-9]/g, '_')}_${termin.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
