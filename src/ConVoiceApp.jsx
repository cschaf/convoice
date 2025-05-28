import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Music, Star, Cake, Clock, MapPin, Filter, X, Menu, Download } from 'lucide-react';

const ConVoiceApp = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Beispiel-Daten für Chormitglieder und Events
    const generateSampleData = () => {
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

    const [allTermine] = useState(generateSampleData());

    // Gefilterte Termine
    const filteredTermine = useMemo(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        return allTermine.filter(termin => {
            // Suchfilter
            if (searchTerm && !termin.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !termin.date.includes(searchTerm)) {
                return false;
            }

            // Jahresfilter
            if (yearFilter !== 'all' && !termin.date.startsWith(yearFilter)) {
                return false;
            }

            // Typfilter
            if (typeFilter !== 'all' && termin.type !== typeFilter) {
                return false;
            }

            // Zeitfilter
            if (timeFilter === 'upcoming' && termin.date < today) {
                return false;
            }

            return true;
        });
    }, [allTermine, searchTerm, yearFilter, typeFilter, timeFilter]);

    // Nächster Termin
    const nextTermin = useMemo(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        return allTermine.find(termin => termin.date >= today);
    }, [allTermine]);

    // Verfügbare Jahre
    const availableYears = useMemo(() => {
        const years = [...new Set(allTermine.map(t => t.date.substring(0, 4)))];
        return years.sort();
    }, [allTermine]);

    const getTerminIcon = (type) => {
        switch (type) {
            case 'chorprobe': return <Music className="w-5 h-5" />;
            case 'event': return <Star className="w-5 h-5" />;
            case 'geburtstag': return <Cake className="w-5 h-5" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    };

    const getTerminColor = (type) => {
        switch (type) {
            case 'chorprobe': return 'border-blue-500 bg-blue-50';
            case 'event': return 'border-amber-500 bg-amber-50';
            case 'geburtstag': return 'border-pink-500 bg-pink-50';
            default: return 'border-gray-500 bg-gray-50';
        }
    };

    const getTerminAccent = (type) => {
        switch (type) {
            case 'chorprobe': return 'text-blue-600';
            case 'event': return 'text-amber-600';
            case 'geburtstag': return 'text-pink-600';
            default: return 'text-gray-600';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isTerminPast = (dateStr) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        return dateStr < today;
    };

    const getDaysUntilTermin = (dateStr) => {
        const now = new Date();
        const terminDate = new Date(dateStr);
        const diffTime = terminDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // ICS Kalender Download Funktion
    const downloadICS = (termin) => {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-lg border-b-4 border-amber-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-full">
                                <Music className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">ConVoice</h1>
                                <p className="text-gray-600">Gospel Chor Bremen</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Suchleiste */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Termine durchsuchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className={`lg:w-80 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <Filter className="w-5 h-5 mr-2" />
                                    Filter
                                </h2>
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="lg:hidden p-1 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Jahresfilter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jahr
                                    </label>
                                    <select
                                        value={yearFilter}
                                        onChange={(e) => setYearFilter(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="all">Alle Jahre</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Typfilter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Terminart
                                    </label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="all">Alle Termine</option>
                                        <option value="chorprobe">Chorproben</option>
                                        <option value="event">Events</option>
                                        <option value="geburtstag">Geburtstage</option>
                                    </select>
                                </div>

                                {/* Zeitfilter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Zeitraum
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="upcoming"
                                                checked={timeFilter === 'upcoming'}
                                                onChange={(e) => setTimeFilter(e.target.value)}
                                                className="mr-2"
                                            />
                                            Kommende Termine
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="all"
                                                checked={timeFilter === 'all'}
                                                onChange={(e) => setTimeFilter(e.target.value)}
                                                className="mr-2"
                                            />
                                            Alle Termine
                                        </label>
                                    </div>
                                </div>

                                {/* Statistiken */}
                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Übersicht</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div>Gesamt: {filteredTermine.length} Termine</div>
                                        <div>Chorproben: {filteredTermine.filter(t => t.type === 'chorprobe').length}</div>
                                        <div>Events: {filteredTermine.filter(t => t.type === 'event').length}</div>
                                        <div>Geburtstage: {filteredTermine.filter(t => t.type === 'geburtstag').length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hauptinhalt */}
                    <div className="flex-1">
                        {/* Nächster Termin Hervorhebung */}
                        {nextTermin && timeFilter === 'upcoming' && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Nächster Termin</h2>
                                <div className={`p-6 rounded-xl border-2 ${getTerminColor(nextTermin.type)} shadow-lg ring-2 ring-amber-200 transform hover:scale-105 transition-transform duration-200`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className={`p-3 rounded-full ${getTerminAccent(nextTermin.type)} bg-white`}>
                                                {getTerminIcon(nextTermin.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900">{nextTermin.title}</h3>
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                            Nächster Termin
                          </span>
                                                </div>
                                                <p className="text-gray-600 mb-2">{formatDate(nextTermin.date)}</p>
                                                {nextTermin.startTime && (
                                                    <div className="flex items-center text-gray-500 mb-2">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {nextTermin.startTime} - {nextTermin.endTime}
                                                    </div>
                                                )}
                                                {nextTermin.location && (
                                                    <div className="flex items-center text-gray-500 mb-2">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {nextTermin.location}
                                                    </div>
                                                )}
                                                <p className="text-gray-700">{nextTermin.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => downloadICS(nextTermin)}
                                                className="mb-4 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-amber-600 hover:text-amber-700"
                                                title="Zu Kalender hinzufügen"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <div className="text-2xl font-bold text-amber-600">
                                                {getDaysUntilTermin(nextTermin.date)} Tage
                                            </div>
                                            <div className="text-sm text-gray-500">bis zum Termin</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Terminliste */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {timeFilter === 'upcoming' && nextTermin ? 'Weitere Termine' : 'Alle Termine'}
                            </h2>

                            {filteredTermine.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Termine gefunden</h3>
                                    <p className="text-gray-500">Versuche andere Filtereinstellungen.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredTermine
                                        .filter(termin => timeFilter !== 'upcoming' || !nextTermin || termin.id !== nextTermin.id)
                                        .map((termin) => {
                                            const isPast = isTerminPast(termin.date);
                                            return (
                                                <div
                                                    key={termin.id}
                                                    className={`p-6 rounded-lg border-l-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 ${
                                                        getTerminColor(termin.type)
                                                    } ${isPast ? 'opacity-60' : ''}`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className={`p-2 rounded-full ${getTerminAccent(termin.type)} ${isPast ? 'opacity-50' : ''}`}>
                                                            {getTerminIcon(termin.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h3 className={`font-semibold text-gray-900 ${isPast ? 'line-through' : ''}`}>
                                                                    {termin.title}
                                                                </h3>
                                                                <button
                                                                    onClick={() => downloadICS(termin)}
                                                                    className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 ${getTerminAccent(termin.type)} ${isPast ? 'opacity-50' : ''}`}
                                                                    title="Zu Kalender hinzufügen"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {formatDate(termin.date)}
                                                            </p>
                                                            {termin.startTime && (
                                                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                                                    <Clock className="w-4 h-4 mr-1" />
                                                                    {termin.startTime} - {termin.endTime}
                                                                </div>
                                                            )}
                                                            {termin.location && (
                                                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                                                    <MapPin className="w-4 h-4 mr-1" />
                                                                    {termin.location}
                                                                </div>
                                                            )}
                                                            <p className="text-sm text-gray-700">{termin.description}</p>
                                                            {!isPast && (
                                                                <div className="mt-2 text-xs text-gray-500">
                                                                    in {getDaysUntilTermin(termin.date)} Tagen
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConVoiceApp;