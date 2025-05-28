import React from 'react';
import { Music, Menu, Search } from 'lucide-react';

const Header = ({ searchTerm, setSearchTerm, mobileFiltersOpen, setMobileFiltersOpen }) => {
  return (
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
  );
};

export default Header;
