import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import EventCard from './components/EventCard';
import NextEventHighlight from './components/NextEventHighlight';
import { downloadICS } from './utils/icsHelper';
import { generateSampleData } from './data/sampleData'; // Import generateSampleData
// Removed: import { events as initialEventsData } from './data/events.js';
import { members as membersListData } from './data/members.js';
import { getYearlyData } from './data/yearlyDataLoader.js'; // Added import

const ConVoiceApp = () => {
    const [allTermine, setAllTermine] = useState([]); // Changed to manage with setAllTermine
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Beispiel-Daten für Chormitglieder und Events was removed from here.
    // It's now imported from ../data/sampleData.js

    // Removed hardcoded exampleExceptionalDates, sommerferien, herbstferien, weihnachtsferien, and exampleExceptionalTimespans

    useEffect(() => {
        const loadData = async () => {
            const currentYear = new Date().getFullYear();
            const currentYearData = await getYearlyData(currentYear);
            const previousYearData = await getYearlyData(currentYear - 1);

            const initialEvents = currentYearData.events; // Use events from current year's data
            const combinedExceptionalDates = currentYearData.exceptionalDates;
            // Timespans from previous year might extend into the current year (e.g. Christmas holidays)
            const combinedExceptionalTimespans = [
                ...(previousYearData.exceptionalTimespans || []), // Add guard for potentially undefined timespans
                ...(currentYearData.exceptionalTimespans || [])   // Add guard for potentially undefined timespans
            ];
            
            const data = generateSampleData(
                initialEvents,
                membersListData, // membersListData is still imported and used
                combinedExceptionalDates,
                combinedExceptionalTimespans
            );
            setAllTermine(data);
        };

        loadData();
    }, []); // Empty dependency array ensures this runs once on mount

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

    // ICS Kalender Download Funktion was removed from here.
    // It's now imported from ../utils/icsHelper.js

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
            <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                mobileFiltersOpen={mobileFiltersOpen}
                setMobileFiltersOpen={setMobileFiltersOpen}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar
                        mobileFiltersOpen={mobileFiltersOpen}
                        setMobileFiltersOpen={setMobileFiltersOpen}
                        yearFilter={yearFilter}
                        setYearFilter={setYearFilter}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        availableYears={availableYears}
                        filteredTermine={filteredTermine}
                    />

                    {/* Hauptinhalt */}
                    <div className="flex-1">
                        {/* Nächster Termin Hervorhebung */}
                        {nextTermin && timeFilter === 'upcoming' && (
                            <NextEventHighlight
                                nextTermin={nextTermin}
                                // getTerminColor, getTerminAccent, getTerminIcon, formatDate, getDaysUntilTermin props removed
                                onDownloadICS={downloadICS}
                            />
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
                                        .map((termin) => (
                                            <EventCard
                                                key={termin.id}
                                                termin={termin}
                                                // getTerminColor, getTerminAccent, getTerminIcon, formatDate, isTerminPast, getDaysUntilTermin props removed
                                                onDownloadICS={downloadICS}
                                            />
                                        ))}
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