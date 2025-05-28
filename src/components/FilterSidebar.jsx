import React from 'react';
import { Filter, X } from 'lucide-react';

const FilterSidebar = ({
  mobileFiltersOpen,
  setMobileFiltersOpen,
  yearFilter,
  setYearFilter,
  typeFilter,
  setTypeFilter,
  timeFilter,
  setTimeFilter,
  availableYears,
  filteredTermine
}) => {
  return (
    <div className={`lg:w-80 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 dark:bg-slate-800"> {/* Main background */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-slate-100"> {/* Title "Filter" */}
            <Filter className="w-5 h-5 mr-2" /> {/* Icon inherits color */}
            Filter
          </h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="lg:hidden p-1 rounded dark:text-slate-300" /* Mobile close button icon color */
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Jahresfilter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300"> {/* Section label */}
              Jahr
            </label>
            <select
              value={yearFilter || ''} // Handle null value for selectedYear
              onChange={(e) => setYearFilter(parseInt(e.target.value, 10))} // Parse value to int
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:border-gray-600 dark:text-slate-100 dark:focus:ring-amber-600"
            >
              {/* Removed: <option value="all">Alle Jahre</option> */}
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Typfilter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300"> {/* Section label */}
              Terminart
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:border-gray-600 dark:text-slate-100 dark:focus:ring-amber-600"
            >
              <option value="all">Alle Termine</option>
              <option value="chorprobe">Chorproben</option>
              <option value="event">Events</option>
              <option value="geburtstag">Geburtstage</option>
            </select>
          </div>

          {/* Zeitfilter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300"> {/* Section label */}
              Zeitraum
            </label>
            <div className="space-y-2">
              <label className="flex items-center dark:text-slate-300"> {/* Radio button label text */}
                <input
                  type="radio"
                  value="upcoming"
                  checked={timeFilter === 'upcoming'}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="mr-2" // Radio buttons styled by Tailwind Forms plugin or browser default
                />
                Kommende Termine
              </label>
              <label className="flex items-center dark:text-slate-300"> {/* Radio button label text */}
                <input
                  type="radio"
                  value="all"
                  checked={timeFilter === 'all'}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="mr-2" // Radio buttons styled by Tailwind Forms plugin or browser default
                />
                Alle Termine
              </label>
            </div>
          </div>

          {/* Statistiken */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700"> {/* Separator border */}
            <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Übersicht</h3> {/* Section label */}
            <div className="space-y-1 text-sm text-gray-600 dark:text-slate-400"> {/* Statistic text */}
              <div>Gesamt: {filteredTermine.length} Termine</div>
              <div>Chorproben: {filteredTermine.filter(t => t.type === 'chorprobe').length}</div>
              <div>Events: {filteredTermine.filter(t => t.type === 'event').length}</div>
              <div>Geburtstage: {filteredTermine.filter(t => t.type === 'geburtstag').length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
