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
import { getInitialTheme, applyTheme } from './utils/theme.js'; // Added theme imports

const ConVoiceApp = () => {
    const [theme, setTheme] = useState(getInitialTheme()); // Added theme state
    const [allTermine, setAllTermine] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(null); // Renamed from yearFilter, initialized to null
    const [availableYears, setAvailableYears] = useState([]); // New state for available years
    const [typeFilter, setTypeFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // useEffect to load config and set initial selectedYear
    useEffect(() => {
        const loadAppConfig = async () => {
            try {
                // Changed to dynamic import. Path is relative to this file (src/ConVoiceApp.jsx)
                const configModule = await import('./data/config.json'); 
                const config = configModule.default || configModule; // Handle default export

                setAvailableYears(config.availableYears);

                const actualCurrentYear = new Date().getFullYear();
                if (config.availableYears.includes(actualCurrentYear)) {
                    setSelectedYear(actualCurrentYear);
                } else if (config.availableYears.length > 0) {
                    setSelectedYear(config.availableYears[0]); // Default to the first available year
                } else {
                    setSelectedYear(actualCurrentYear); // Fallback to actual current year
                }
            } catch (error) {
                console.error("Failed to load app config via import:", error); // Updated error message
                // Fallback in case config loading fails
                setAvailableYears([new Date().getFullYear()]);
                setSelectedYear(new Date().getFullYear());
            }
        };
        loadAppConfig();
    }, []); // Runs once on mount

    // useEffect to apply the current theme
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // useEffect to load data based on selectedYear
    useEffect(() => {
        if (!selectedYear) return; // Don't load data if no year is selected

        const loadData = async () => {
            const currentYearData = await getYearlyData(selectedYear);
            const previousYearData = await getYearlyData(selectedYear - 1);

            const initialEvents = currentYearData.events;
            const combinedExceptionalDates = currentYearData.exceptionalDates;
            const combinedExceptionalTimespans = [
                ...(previousYearData.exceptionalTimespans || []),
                ...(currentYearData.exceptionalTimespans || [])
            ];
            
            const data = generateSampleData(
                initialEvents,
                membersListData,
                combinedExceptionalDates,
                combinedExceptionalTimespans,
                selectedYear // Pass selectedYear as targetYear
            );
            setAllTermine(data);
        };

        loadData();
    }, [selectedYear]); // Runs when selectedYear changes

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

            // Jahresfilter - uses selectedYear directly as it's a number, not 'all'
            if (selectedYear && !termin.date.startsWith(selectedYear.toString())) {
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
    }, [allTermine, searchTerm, selectedYear, typeFilter, timeFilter]); // Updated dependency to selectedYear

    // Nächster Termin
    const nextTermin = useMemo(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        return allTermine.find(termin => termin.date >= today);
    }, [allTermine]);

    // Removed old availableYears useMemo, as it's now a state loaded from config.json

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
            <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                mobileFiltersOpen={mobileFiltersOpen}
                setMobileFiltersOpen={setMobileFiltersOpen}
                theme={theme} // Pass theme state
                setTheme={setTheme} // Pass setTheme function
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar
                        mobileFiltersOpen={mobileFiltersOpen}
                        setMobileFiltersOpen={setMobileFiltersOpen}
                        yearFilter={selectedYear} // Changed prop name
                        setYearFilter={setSelectedYear} // Changed prop name
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        availableYears={availableYears} // Pass new state
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