import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import EventCard from './components/EventCard';
import NextEventHighlight from './components/NextEventHighlight';
import DataEntryPage from './pages/DataEntryPage';
import ScrollToTopButton from './components/ScrollToTopButton';
import { downloadICS } from '../../infrastructure/services/icsHelper';
import LoginPage from './components/LoginPage';
import { getInitialTheme, applyTheme } from '../theme.js';
import { Toaster } from "sonner";

// Domain Entities (AppConfig might be useful for initial state type)
// import AppConfig from '../../../domain/entities/AppConfig.js'; // If needed for state type

// Repositories
import { JsonAppConfigRepository } from '../../infrastructure/data/JsonAppConfigRepository.js';
import { JsonMemberRepository } from '../../infrastructure/data/JsonMemberRepository.js';
import { JsonYearlyDataRepository } from '../../infrastructure/data/JsonYearlyDataRepository.js';

// Domain Services
import ScheduleGeneratorService from '../../domain/services/ScheduleGeneratorService.js';

// Application Use Cases
import { GetAppConfigUseCase } from '../../application/usecases/GetAppConfigUseCase.js';
import { LoadScheduleUseCase } from '../../application/usecases/LoadScheduleUseCase.js';
import { LoadAvailableYearsUseCase } from '../../application/usecases/LoadAvailableYearsUseCase.js';
import { ManageYearlyDataUseCase } from '../../application/usecases/ManageYearlyDataUseCase.js';
// YearlyRawData might be needed if ConVoiceApp still constructs it, but ideally LoadScheduleUseCase handles this.
// import YearlyRawData from '../../../domain/entities/YearlyRawData.js';


// Instantiate dependencies
// These instances are created once when the App component module is loaded.
// They don't depend on component state/props for their own instantiation.
const jsonAppConfigRepository = new JsonAppConfigRepository();
const jsonMemberRepository = new JsonMemberRepository();
const jsonYearlyDataRepository = new JsonYearlyDataRepository();
const scheduleGeneratorService = new ScheduleGeneratorService();

const getAppConfigUseCase = new GetAppConfigUseCase(jsonAppConfigRepository);
const loadScheduleUseCase = new LoadScheduleUseCase(jsonYearlyDataRepository, jsonMemberRepository, scheduleGeneratorService);
// For available years, we can either use AppConfig or directly from YearlyDataRepository if that's the source of truth for displayed years.
// The old code used config.json's availableYears, which JsonAppConfigRepository provides via AppConfig entity.
// However, LoadAvailableYearsUseCase is also provided, which uses IYearlyDataRepository.getAvailableYears().
// Let's assume for now that available years for selection should come from where data actually exists, so IYearlyDataRepository.
const loadAvailableYearsUseCase = new LoadAvailableYearsUseCase(jsonYearlyDataRepository);
const manageYearlyDataUseCase = new ManageYearlyDataUseCase(jsonYearlyDataRepository);


const ConVoiceApp = () => {
    const [theme, setTheme] = useState(getInitialTheme());
    const [allTermine, setAllTermine] = useState([]); // Will hold Event instances
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);
    // const [appConfig, setAppConfig] = useState(null); // Optional: if you want to store the full AppConfig entity

    const [typeFilter, setTypeFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [showDataEntryPage, setShowDataEntryPage] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLoginSuccess = () => {
      setIsAuthenticated(true);
    };

    const handleLogout = () => {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
    };

    const handleToggleDataEntryPage = () => {
        setShowDataEntryPage(prev => !prev);
    };

    // Effect for loading available years and setting initial selected year
    useEffect(() => {
        const fetchInitialConfig = async () => {
            try {
                // Option 1: Use LoadAvailableYearsUseCase (if years come from data files presence)
                const years = await loadAvailableYearsUseCase.execute();

                // Option 2: Use GetAppConfigUseCase (if years come from a central config defined in AppConfig)
                // const currentAppConfig = await getAppConfigUseCase.execute();
                // setAppConfig(currentAppConfig); // if you need the full config object
                // const years = currentAppConfig.availableYears;

                setAvailableYears(years || []);

                const actualCurrentYear = new Date().getFullYear();
                if (years && years.includes(actualCurrentYear)) {
                    setSelectedYear(actualCurrentYear);
                } else if (years && years.length > 0) {
                    // Default to the latest available year if current year is not in the list
                     setSelectedYear(Math.max(...years)); // or years[0] if sorted ascending and want earliest
                } else {
                    setSelectedYear(actualCurrentYear); // Fallback if no years available
                }
            } catch (error) {
                console.error("Error loading application configuration:", error);
                setAvailableYears([new Date().getFullYear()]); // Fallback
                setSelectedYear(new Date().getFullYear()); // Fallback
            }
        };
        fetchInitialConfig();
    }, []);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
        handleLoginSuccess();
      }
    }, []);

    // Effect for loading schedule data when selectedYear changes
    useEffect(() => {
        if (!selectedYear || showDataEntryPage) {
            if (showDataEntryPage) setAllTermine([]); // Clear schedule if navigating to data entry
            return;
        }

        const loadData = async () => {
            try {
                // LoadScheduleUseCase is now responsible for fetching all necessary data,
                // including handling previous year's exceptional timespans if it's refactored to do so.
                // For this subtask, we assume it correctly returns the schedule for 'selectedYear'.
                const scheduleEvents = await loadScheduleUseCase.execute(selectedYear);
                setAllTermine(scheduleEvents || []);
            } catch (error) {
                console.error(`Error loading schedule for year ${selectedYear}:`, error);
                setAllTermine([]); // Set to empty on error
            }
        };
        loadData();
    }, [selectedYear, showDataEntryPage]);

    const filteredTermine = useMemo(() => {
        if (showDataEntryPage) return [];
        const now = new Date();
        // Ensure correct date comparison: dates from Event entities are 'YYYY-MM-DD' strings
        const today = now.toISOString().split('T')[0];

        return allTermine.filter(termin => {
            // termin is now an Event instance
            if (searchTerm && !termin.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !termin.date.includes(searchTerm)) {
                return false;
            }
            // selectedYear is a number, termin.date is 'YYYY-MM-DD'
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
    }, [allTermine, searchTerm, selectedYear, typeFilter, timeFilter, showDataEntryPage]);

    const nextDayEvents = useMemo(() => {
        if (showDataEntryPage || allTermine.length === 0) return null;

        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const upcomingTermine = allTermine
            .filter(termin => termin.date >= today)
            .sort((a, b) => { // Sort by date, then by startTime
                const dateComparison = a.date.localeCompare(b.date);
                if (dateComparison !== 0) return dateComparison;
                return (a.startTime || '').localeCompare(b.startTime || '');
            });

        if (upcomingTermine.length === 0) {
            return null;
        }

        const soonestDate = upcomingTermine[0].date;
        const eventsOnSoonestDate = upcomingTermine.filter(termin => termin.date === soonestDate);

        return eventsOnSoonestDate.length > 0 ? eventsOnSoonestDate : null;
    }, [allTermine, showDataEntryPage]);

    return (
      <>
        {!isAuthenticated ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
            <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                mobileFiltersOpen={mobileFiltersOpen}
                setMobileFiltersOpen={setMobileFiltersOpen}
                theme={theme}
                setTheme={setTheme}
                onToggleDataEntryPage={handleToggleDataEntryPage}
                isDataEntryPageActive={showDataEntryPage}
                onLogout={handleLogout}
            />

            {showDataEntryPage ? (
                 <div className="max-w-4xl mx-auto mt-8 p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    <DataEntryPage
                        manageYearlyDataUseCase={manageYearlyDataUseCase}
                        availableYears={availableYears}
                    />
                    <button
                        onClick={handleToggleDataEntryPage}
                        className="mt-8 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                    >
                        Zurück zur Kalenderansicht
                    </button>
                </div>
            ) : (
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
                            {nextDayEvents && nextDayEvents.length > 0 && timeFilter === 'upcoming' && (
                                <NextEventHighlight
                                    nextEvents={nextDayEvents}
                                    onDownloadICS={downloadICS} // downloadICS from icsHelper is fine
                                />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
                                    {timeFilter === 'upcoming' && nextDayEvents && nextDayEvents.length > 0 ? 'Weitere Termine' : 'Alle Termine'}
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
                                            .filter(termin => timeFilter !== 'upcoming' || !nextDayEvents || !nextDayEvents.find(ne => ne.id === termin.id))
                                            .map((termin) => (
                                                <EventCard
                                                    key={termin.id} // Event instances should have unique IDs
                                                    termin={termin} // Pass Event instance
                                                    onDownloadICS={downloadICS}
                                                />
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ScrollToTopButton />
          </div>
        )}
        <Toaster />
      </>
    );
};

export default ConVoiceApp;