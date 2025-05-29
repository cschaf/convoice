import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import EventCard from './components/EventCard';
import NextEventHighlight from './components/NextEventHighlight';
import DataEntryPage from './components/DataEntryPage'; // Import DataEntryPage
import { downloadICS } from './utils/icsHelper';
import { generateSampleData } from './data/sampleData';
import { members as membersListData } from './data/members.js';
import { getYearlyData } from './data/yearlyDataLoader.js';
import { getInitialTheme, applyTheme } from './utils/theme.js';

const ConVoiceApp = () => {
    const [theme, setTheme] = useState(getInitialTheme());
    const [allTermine, setAllTermine] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);
    const [typeFilter, setTypeFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [showDataEntryPage, setShowDataEntryPage] = useState(false); // New state for DataEntryPage

    // Function to toggle DataEntryPage visibility
    const handleToggleDataEntryPage = () => {
        setShowDataEntryPage(prev => !prev);
    };

    useEffect(() => {
        const loadAppConfig = async () => {
            try {
                const configModule = await import('./data/config.json');
                const config = configModule.default || configModule;
                setAvailableYears(config.availableYears);
                const actualCurrentYear = new Date().getFullYear();
                if (config.availableYears.includes(actualCurrentYear)) {
                    setSelectedYear(actualCurrentYear);
                } else if (config.availableYears.length > 0) {
                    setSelectedYear(config.availableYears[0]);
                } else {
                    setSelectedYear(actualCurrentYear);
                }
            } catch (error) {
                console.error("Fehler beim Laden der App-Konfiguration via Import:", error);
                setAvailableYears([new Date().getFullYear()]);
                setSelectedYear(new Date().getFullYear());
            }
        };
        loadAppConfig();
    }, []);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        if (!selectedYear || showDataEntryPage) return; // Don't load data if no year or if on DataEntryPage

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
                selectedYear
            );
            setAllTermine(data);
        };
        loadData();
    }, [selectedYear, showDataEntryPage]); // Added showDataEntryPage to dependencies

    const filteredTermine = useMemo(() => {
        if (showDataEntryPage) return []; // No need to filter if on DataEntryPage
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        return allTermine.filter(termin => {
            if (searchTerm && !termin.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !termin.date.includes(searchTerm)) {
                return false;
            }
            if (selectedYear && !termin.date.startsWith(selectedYear.toString())) {
                return false;
            }
            if (typeFilter !== 'all' && termin.type !== typeFilter) {
                return false;
            }
            if (timeFilter === 'upcoming' && termin.date < today) {
                return false;
            }
            return true;
        });
    }, [allTermine, searchTerm, selectedYear, typeFilter, timeFilter, showDataEntryPage]); // Added showDataEntryPage

    const nextTermin = useMemo(() => {
        if (showDataEntryPage) return null; // No next termin if on DataEntryPage
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        return allTermine.find(termin => termin.date >= today);
    }, [allTermine, showDataEntryPage]); // Added showDataEntryPage

    // If showDataEntryPage is true, render only DataEntryPage
    if (showDataEntryPage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 p-4">
                <Header
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm}
                    mobileFiltersOpen={mobileFiltersOpen} 
                    setMobileFiltersOpen={setMobileFiltersOpen}
                    theme={theme}
                    setTheme={setTheme}
                    onToggleDataEntryPage={handleToggleDataEntryPage} 
                    isDataEntryPageActive={true} 
                />
                 <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    <DataEntryPage />
                    <button 
                        onClick={handleToggleDataEntryPage} 
                        className="mt-8 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                    >
                        Zurück zur Kalenderansicht
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
            <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                mobileFiltersOpen={mobileFiltersOpen}
                setMobileFiltersOpen={setMobileFiltersOpen}
                theme={theme}
                setTheme={setTheme}
                onToggleDataEntryPage={handleToggleDataEntryPage} 
                isDataEntryPageActive={false}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar
                        mobileFiltersOpen={mobileFiltersOpen}
                        setMobileFiltersOpen={setMobileFiltersOpen}
                        yearFilter={selectedYear}
                        setYearFilter={setSelectedYear}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        availableYears={availableYears}
                        filteredTermine={filteredTermine}
                    />
                    <div className="flex-1">
                        {nextTermin && timeFilter === 'upcoming' && (
                            <NextEventHighlight
                                nextTermin={nextTermin}
                                onDownloadICS={downloadICS}
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
                                {timeFilter === 'upcoming' && nextTermin ? 'Weitere Termine' : 'Alle Termine'}
                            </h2>
                            {filteredTermine.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Termine gefunden</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Versuche andere Filtereinstellungen.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredTermine
                                        .filter(termin => timeFilter !== 'upcoming' || !nextTermin || termin.id !== nextTermin.id)
                                        .map((termin) => (
                                            <EventCard
                                                key={termin.id}
                                                termin={termin}
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