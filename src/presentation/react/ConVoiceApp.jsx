import React, { useState, useEffect, useMemo } from 'react';
// Calendar is now only used in EventsPage
// import { Calendar } from 'lucide-react';
import Header from './components/Header';
// FilterSidebar is now used in EventsPage
// import FilterSidebar from './components/FilterSidebar';
// EventCard is now used in EventsPage
// import EventCard from './components/EventCard';
// NextEventHighlight is now used in EventsPage
// import NextEventHighlight from './components/NextEventHighlight';
import DataEntryPage from './pages/DataEntryPage';
import EventsPage from './pages/EventsPage.jsx'; // Import EventsPage
import ScrollToTopButton from './components/ScrollToTopButton';
import { downloadICS } from '../../infrastructure/services/icsHelper';
import LoginPage from './pages/LoginPage.jsx';
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
    // allTermine state is moved to EventsPage
    // const [allTermine, setAllTermine] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(null); // Stays in ConVoiceApp, passed as initialSelectedYear
    const [availableYears, setAvailableYears] = useState([]);
    // const [appConfig, setAppConfig] = useState(null);

    // typeFilter and timeFilter states are moved to EventsPage
    // const [typeFilter, setTypeFilter] = useState('all');
    // const [timeFilter, setTimeFilter] = useState('upcoming');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false); // Stays, passed to Header and EventsPage
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

    // useEffect for loading schedule data is moved to EventsPage
    // filteredTermine useMemo is moved to EventsPage
    // nextDayEvents useMemo is moved to EventsPage

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
                <EventsPage
                    searchTerm={searchTerm}
                    availableYears={availableYears}
                    initialSelectedYear={selectedYear} // Pass ConVoiceApp's selectedYear as initialSelectedYear
                    loadScheduleUseCase={loadScheduleUseCase} // Pass the use case instance
                    downloadICS={downloadICS} // Pass the helper function
                    mobileFiltersOpen={mobileFiltersOpen}
                    setMobileFiltersOpen={setMobileFiltersOpen}
                />
            )}
            <ScrollToTopButton />
          </div>
        )}
        <Toaster />
      </>
    );
};

export default ConVoiceApp;