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
            let dateTimeLine = `<p><strong>Date:</strong> ${formatDateForPrint(event.date)}`;
            if (event.startTime) {
                dateTimeLine += ` &nbsp;&nbsp;<strong>Time:</strong> ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`;
            }
            dateTimeLine += `</p>`;

            eventsHtml += `
                <div class="event-item">
                    <h3>${event.title}</h3>
                    ${dateTimeLine}
                    ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
                    ${event.description ? `<p class="description"><strong>Description:</strong> ${event.description}</p>` : ''}
                </div>`;
        });
        eventsHtml += `</div>`; // Closing events-grid container
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
                            margin: 20mm; /* A4 margins */
                            color: #333;
                            font-size: 11pt; /* Increased base font size */
                            line-height: 1.4; /* Default line height */
                            width: auto;
                        }
                        h1 {
                            text-align: center;
                            font-size: 1.8em; /* Relative to 11pt */
                            margin-bottom: 25px;
                            color: #000;
                        }
                        .month-section {
                            margin-bottom: 20px; /* Space between month sections */
                            page-break-after: auto;
                        }
                        .month-section:last-child {
                            page-break-after: avoid;
                        }
                        h2 { /* Month/Year headings */
                            font-size: 1.4em; /* Relative to 11pt */
                            color: #000;
                            border-bottom: 1px solid #ccc; /* Softer border */
                            padding-bottom: 4px;
                            margin-bottom: 15px;
                            page-break-after: avoid;
                        }
                        .events-grid { /* Container for event items within a month */
                            display: flex;
                            flex-wrap: wrap;
                            gap: 10px; /* Space between cards */
                        }
                        .event-item {
                            flex: 0 1 calc(50% - 5px); /* 2 columns, accounting for 10px gap */
                            box-sizing: border-box;
                            margin-bottom: 10px; /* Vertical spacing for rows */
                            padding: 10px;
                            border: 1px solid #ccc; /* Softer border */
                            border-radius: 4px; /* Slightly smaller radius */
                            background-color: #f9f9f9;
                            page-break-inside: avoid;
                            display: flex;
                            flex-direction: column; /* Stack content vertically */
                        }
                        .event-item h3 { /* Event title */
                            font-size: 1.1em; /* Relative to 11pt */
                            margin-top: 0;
                            margin-bottom: 8px;
                            color: #444; /* Softer black */
                        }
                        .event-item p {
                            margin: 4px 0;
                            font-size: 0.9em; /* Relative to 11pt (approx 9.9pt) */
                            line-height: 1.4;
                        }
                        .event-item p strong {
                            font-weight: bold;
                            color: #000;
                        }
                        .description {
                            font-style: italic;
                            font-size: 0.85em; /* Relative to 11pt (approx 9.35pt) */
                            margin-top: auto; /* Pushes description to the bottom */
                            padding-top: 6px; /* Space above description */
                            color: #555; /* Lighter description text */
                        }
                        .no-print { display: none !important; }
                    }
                    /* Screen styles for previewing */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                        background-color: #fff;
                        font-size: 11pt; /* Match print for consistency in preview */
                        line-height: 1.4;
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
                        font-size: 1.4em;
                        color: #000;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 4px;
                        margin-bottom: 15px;
                    }
                    .events-grid { /* Screen preview for grid */
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                    }
                    .event-item {
                        flex: 0 1 calc(50% - 5px); /* 2 columns for screen preview too */
                        box-sizing: border-box;
                        margin-bottom: 10px;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        background-color: #f9f9f9;
                        display: flex;
                        flex-direction: column;
                    }
                    .event-item h3 {
                        font-size: 1.1em;
                        margin-top: 0;
                        margin-bottom: 8px;
                        color: #444;
                    }
                    .event-item p {
                        margin: 4px 0;
                        font-size: 0.9em;
                        line-height: 1.4;
                    }
                    .event-item p strong {
                        font-weight: bold;
                        color: #000;
                    }
                    .description {
                        font-style: italic;
                        font-size: 0.85em;
                        margin-top: auto;
                        padding-top: 6px;
                        color: #555;
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
