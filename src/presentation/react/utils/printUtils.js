// Helper to format date, e.g., DD.MM.YYYY
const formatDateForPrint = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

// Helper to format month and year, e.g., "January 2024"
const formatMonthYear = (dateString) => {
    const date = new Date(dateString);
    // Ensure the date is treated as UTC to avoid off-by-one day issues due to timezone conversion.
    // JavaScript date parsing can be tricky with "YYYY-MM-DD" strings.
    // By appending 'T00:00:00Z', we explicitly state it's UTC.
    const utcDate = new Date(dateString + 'T00:00:00Z');
    return utcDate.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export const generatePrintableEventsHtml = (events) => {
    if (!events || events.length === 0) {
        return `
            <html>
                <head>
                    <title>Termine drucken</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; padding-top: 50px; }
                    </style>
                </head>
                <body>
                    <p>Keine Termine zum Drucken vorhanden.</p>
                </body>
            </html>
        `;
    }

    // Group events by month and year
    const groupedEvents = events.reduce((acc, event) => {
        const monthYear = formatMonthYear(event.date);
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(event);
        return acc;
    }, {});

    let eventsHtml = '';
    for (const monthYear in groupedEvents) {
        eventsHtml += `<section class="month-section">`;
        eventsHtml += `<h2>${monthYear}</h2>`;
        eventsHtml += `<div class="events-grid">`; // Added events-grid container
        // Sort events within each month by date and then by start time
        const sortedEventsInMonth = groupedEvents[monthYear].sort((a, b) => {
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;
            if (a.startTime && b.startTime) {
                return a.startTime.localeCompare(b.startTime);
            }
            return 0;
        });

        sortedEventsInMonth.forEach(event => {
            eventsHtml += `
                <div class="event-item">
                    <h3>${event.title}</h3>
                    <p><strong>Datum:</strong> ${formatDateForPrint(event.date)}</p>
                    ${(event.startTime && event.type !== 'geburtstag') ? `<p><strong>Uhrzeit:</strong> ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}</p>` : ''}
                    ${event.location ? `<p><strong>Ort:</strong> ${event.location}</p>` : ''}
                </div>`;
        });
        eventsHtml += `</div>`; // Closing events-grid container
        eventsHtml += `</section>`;
    }

    return `
        <html>
            <head>
                <title>ConVoice Termine</title>
                <style>
                    @media print {
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20mm; /* A4 margins */
                            color: #333;
                            font-size: 10pt; /* Reduced base font size for 3-column */
                            line-height: 1.2; /* UPDATED */
                            width: auto;
                        }
                        h1 {
                            text-align: center;
                            font-size: 1.8em; /* Relative to 10pt */
                            margin-bottom: 20px; /* Slightly reduced */
                            color: #000;
                        }
                        .month-section {
                            margin-bottom: 15px; /* Slightly reduced */
                            page-break-after: auto;
                            page-break-inside: avoid !important; /* ADDED */
                        }
                        .month-section:last-child {
                            page-break-after: avoid;
                        }
                        h2 { /* Month/Year headings */
                            font-size: 1.4em; /* Relative to 10pt (14pt) */
                            color: #000;
                            border-bottom: 1px solid #ccc;
                            padding-bottom: 3px; /* Slightly reduced */
                            margin-bottom: 12px; /* Reduced */
                            page-break-after: avoid;
                        }
                        .events-grid { /* Container for event items */
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px; /* Reduced gap for 3 columns */
                        }
                        .event-item {
                            flex: 0 1 calc(33.333% - 6px); /* 3 columns, accounting for 8px gap (approx 5.33px per item from gap) */
                            box-sizing: border-box;
                            margin-bottom: 8px; /* Reduced margin */
                            padding: 8px; /* Reduced padding */
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            background-color: #f9f9f9;
                            page-break-inside: avoid;
                            display: flex;
                            flex-direction: column;
                        }
                        .event-item h3 { /* Event title */
                            font-size: 1.1em; /* Relative to 10pt (11pt) */
                            margin-top: 0;
                            margin-bottom: 6px; /* Reduced margin */
                            color: #444;
                        }
                        .event-item p { /* Date/Time/Location */
                            margin: 3px 0; /* Reduced margin */
                            font-size: 1em; /* Relative to 10pt (10pt) */
                            line-height: 1.2; /* UPDATED */
                        }
                        .event-item p strong {
                            font-weight: bold;
                            color: #000;
                        }
                        .no-print { display: none !important; }
                    }
                    /* Screen styles for previewing */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                        background-color: #fff;
                        font-size: 10pt; /* Match print for consistency */
                        line-height: 1.2; /* UPDATED */
                    }
                     h1 {
                        text-align: center;
                        font-size: 1.8em;
                        margin-bottom: 20px;
                        color: #000;
                    }
                    .month-section {
                        margin-bottom: 15px;
                        padding: 10px; /* Slightly reduced */
                        border: 1px solid #eee;
                        border-radius: 8px;
                        background-color: #fdfdfd;
                    }
                    h2 {
                        font-size: 1.4em;
                        color: #000;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 3px;
                        margin-bottom: 12px;
                    }
                    .events-grid { /* Screen preview for grid */
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px; /* Match print */
                    }
                    .event-item {
                        flex: 0 1 calc(33.333% - 6px); /* 3 columns for screen preview too */
                        box-sizing: border-box;
                        margin-bottom: 8px;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        background-color: #f9f9f9;
                        display: flex;
                        flex-direction: column;
                    }
                    .event-item h3 {
                        font-size: 1.1em;
                        margin-top: 0;
                        margin-bottom: 6px;
                        color: #444;
                    }
                    .event-item p {
                        margin: 3px 0;
                        font-size: 1em;
                        line-height: 1.2; /* UPDATED */
                    }
                    .event-item p strong {
                        font-weight: bold;
                        color: #000;
                    }
                </style>
            </head>
            <body>
                <h1>Terminübersicht</h1>
                ${eventsHtml}
            </body>
        </html>
    `;
};
