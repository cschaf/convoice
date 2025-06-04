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
                    <title>Print Events</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; padding-top: 50px; }
                    </style>
                </head>
                <body>
                    <p>No events to print.</p>
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
                    <p><strong>Date:</strong> ${formatDateForPrint(event.date)}</p>
                    ${event.startTime ? `<p><strong>Time:</strong> ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}</p>` : ''}
                    ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
                    ${event.description ? `<p class="description"><strong>Description:</strong> ${event.description}</p>` : ''}
                </div>`;
        });
        eventsHtml += `</section>`;
    }

    return `
        <html>
            <head>
                <title>ConVoice Events</title>
                <style>
                    @media print {
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20mm; /* Standard A4 margins */
                            color: #333;
                            width: auto; /* Let browser determine width for print */
                        }
                        h1 {
                            text-align: center;
                            font-size: 1.8em;
                            margin-bottom: 25px;
                            color: #000;
                        }
                        .month-section {
                            margin-bottom: 20px;
                            page-break-after: auto;
                        }
                        .month-section:last-child {
                            page-break-after: avoid;
                        }
                        h2 { /* Month/Year heading */
                            font-size: 1.5em;
                            color: #000;
                            border-bottom: 2px solid #ccc;
                            padding-bottom: 5px;
                            margin-bottom: 15px;
                            page-break-after: avoid; /* Avoid page break right after this header */
                        }
                        .event-item {
                            margin-bottom: 15px;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            background-color: #f9f9f9;
                            page-break-inside: avoid; /* Crucial to keep event content together */
                        }
                        .event-item h3 { /* Event title */
                            font-size: 1.2em;
                            margin-top: 0;
                            margin-bottom: 8px;
                            color: #333; /* Darker for better print readability */
                        }
                        .event-item p {
                            margin: 4px 0;
                            font-size: 0.9em;
                        }
                        .event-item p strong {
                            font-weight: bold;
                            color: #000;
                        }
                        .description {
                            font-style: italic;
                            font-size: 0.85em;
                            color: #444;
                        }
                        /* Hide elements not meant for print if any were accidentally included */
                        .no-print { display: none !important; }
                    }
                    /* Screen styles for previewing (optional but good for dev) */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                        background-color: #fff; /* Ensure a white background for screen preview */
                    }
                     h1 {
                        text-align: center;
                        font-size: 1.8em;
                        margin-bottom: 25px;
                        color: #000;
                    }
                    .month-section {
                        margin-bottom: 20px;
                        padding: 15px;
                        border: 1px solid #eee;
                        border-radius: 8px;
                        background-color: #fdfdfd;
                    }
                    h2 {
                        font-size: 1.5em;
                        color: #000;
                        border-bottom: 2px solid #ccc;
                        padding-bottom: 5px;
                        margin-bottom: 15px;
                    }
                    .event-item {
                        margin-bottom: 15px;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        background-color: #f9f9f9;
                    }
                    .event-item h3 {
                        font-size: 1.2em;
                        margin-top: 0;
                        margin-bottom: 8px;
                        color: #333;
                    }
                    .event-item p {
                        margin: 4px 0;
                        font-size: 0.9em;
                    }
                    .event-item p strong {
                        font-weight: bold;
                        color: #000;
                    }
                    .description {
                        font-style: italic;
                        font-size: 0.85em;
                        color: #444;
                    }
                </style>
            </head>
            <body>
                <h1>Event Schedule</h1>
                ${eventsHtml}
            </body>
        </html>
    `;
};
