import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import EventCard from '../components/EventCard';
import NextEventHighlight from '../components/NextEventHighlight';

const EventsPage = ({
    searchTerm, // Prop
    availableYears, // Prop
    initialSelectedYear, // Prop from ConVoiceApp's selectedYear
    loadScheduleUseCase, // Prop
    downloadICS, // Prop
    mobileFiltersOpen, // Prop
    setMobileFiltersOpen, // Prop
}) => {
    const [allTermine, setAllTermine] = useState([]);
    // Manages its own selectedYear state, initialized by the initialSelectedYear prop.
    // This allows FilterSidebar within EventsPage to change the year for this page's content.
    const [selectedYear, setSelectedYear] = useState(initialSelectedYear);
    const [typeFilter, setTypeFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    // mobileFiltersOpen and setMobileFiltersOpen are props controlled by ConVoiceApp/Header.

    // Effect to update internal selectedYear if the initialSelectedYear prop from ConVoiceApp changes.
    useEffect(() => {
        setSelectedYear(initialSelectedYear);
    }, [initialSelectedYear]);

    // Effect for loading schedule data when selectedYear (internal state) or loadScheduleUseCase prop changes.
    useEffect(() => {
        if (!selectedYear || !loadScheduleUseCase) {
            return;
        }
        const loadData = async () => {
            try {
                const scheduleEvents = await loadScheduleUseCase.execute(selectedYear);
                setAllTermine(scheduleEvents || []);
            } catch (error) {
                console.error(`Error loading schedule for year ${selectedYear}:`, error);
                setAllTermine([]);
            }
        };
        loadData();
    }, [selectedYear, loadScheduleUseCase]);

    const filteredTermine = useMemo(() => {
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
    }, [allTermine, searchTerm, selectedYear, typeFilter, timeFilter]);

    const nextDayEvents = useMemo(() => {
        if (allTermine.length === 0) return null;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const upcomingTermine = allTermine
            .filter(termin => termin.date >= today)
            .sort((a, b) => {
                const dateComparison = a.date.localeCompare(b.date);
                if (dateComparison !== 0) return dateComparison;
                return (a.startTime || '').localeCompare(b.startTime || '');
            });
        if (upcomingTermine.length === 0) return null;
        const soonestDate = upcomingTermine[0].date;
        const eventsOnSoonestDate = upcomingTermine.filter(termin => termin.date === soonestDate);
        return eventsOnSoonestDate.length > 0 ? eventsOnSoonestDate : null;
    }, [allTermine]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <FilterSidebar
                    mobileFiltersOpen={mobileFiltersOpen} // Prop
                    setMobileFiltersOpen={setMobileFiltersOpen} // Prop
                    yearFilter={selectedYear} // Internal state
                    setYearFilter={setSelectedYear} // Internal state setter for EventsPage's selectedYear
                    typeFilter={typeFilter} // Internal state
                    setTypeFilter={setTypeFilter} // Internal state setter
                    timeFilter={timeFilter} // Internal state
                    setTimeFilter={setTimeFilter} // Internal state setter
                    availableYears={availableYears} // Prop
                    filteredTermine={filteredTermine} // Derived state
                />
                <div className="flex-1">
                    {nextDayEvents && nextDayEvents.length > 0 && timeFilter === 'upcoming' && (
                        <NextEventHighlight
                            nextEvents={nextDayEvents}
                            onDownloadICS={downloadICS} // Prop
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
                                            key={termin.id}
                                            termin={termin}
                                            onDownloadICS={downloadICS} // Prop
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventsPage;
