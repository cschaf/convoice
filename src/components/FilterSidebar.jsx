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
  );
};

export default FilterSidebar;
