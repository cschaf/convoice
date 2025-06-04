import React from 'react';
import { Music, Filter, Menu, Search, FilePlus, Calendar, LogOut, Printer } from 'lucide-react'; // Added Printer

const Header = ({
  searchTerm,
  setSearchTerm,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  theme,
  setTheme,
  onToggleDataEntryPage,
  isDataEntryPageActive,
  onLogout, // Added onLogout prop
  filteredEvents // Added filteredEvents prop
}) => {

  const handlePrintEvents = () => {
    if (!filteredEvents || filteredEvents.length === 0) {
        if (window.toast && typeof window.toast.warning === 'function') {
            window.toast.warning("Keine Termine zum Drucken vorhanden.");
        } else {
            alert("Keine Termine zum Drucken vorhanden.");
        }
        return;
    }

    let eventsHtml = '<html><head><title>Terminliste</title>';
    eventsHtml += '<style>body { font-family: sans-serif; margin: 20px; } li { margin-bottom: 10px; }</style>';
    eventsHtml += '</head><body>';
    eventsHtml += '<h1>Terminliste</h1>';
    eventsHtml += '<ol>';

    filteredEvents.forEach(event => {
        const date = new Date(event.date);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
        let eventDetails = `${formattedDate} - ${event.title}`;
        if (event.startTime) {
            eventDetails += ` - ${event.startTime}`;
        }
        if (event.location) {
            eventDetails += ` - ${event.location}`;
        }
        eventsHtml += `<li>${eventDetails}</li>`;
    });

    eventsHtml += '</ol>';
    eventsHtml += '</body></html>';

    const printWindow = window.open('', 'printWindow_' + Date.now(), 'height=800,width=600');

    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(eventsHtml);
        printWindow.document.close();
        setTimeout(() => {
            try {
                printWindow.print();
                printWindow.close();
            } catch (e) {
                console.error("Error during print/close:", e);
                // Attempt to close again if an error occurred, e.g., if print dialog was blocked.
                try {
                    printWindow.close();
                } catch (e2) {
                    console.error("Error during fallback close:", e2);
                }
            }
        }, 250); // 250ms delay
    } else {
        if (window.toast && typeof window.toast.error === 'function') {
            window.toast.error("Druckfenster konnte nicht geöffnet werden. Bitte Pop-up-Blocker überprüfen.");
        } else {
            alert("Druckfenster konnte nicht geöffnet werden. Bitte Pop-up-Blocker überprüfen.");
        }
    }
  };

  return (
    <header className="bg-white shadow-lg border-b-4 border-amber-400 dark:bg-gray-800 dark:border-amber-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-full">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ConVoice</h1>
              <p className="text-gray-600 dark:text-gray-300">Gospel Chor Bremen</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onToggleDataEntryPage && (
              <button
                onClick={onToggleDataEntryPage}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center space-x-2"
                title={isDataEntryPageActive ? "Zurück zur Kalenderansicht" : "Jahresdaten hinzufügen/bearbeiten"}
              >
                {isDataEntryPageActive ? <Calendar className="w-5 h-5" /> : <FilePlus className="w-5 h-5" />}
                <span className="hidden sm:inline">{isDataEntryPageActive ? "Kalender" : "Daten verwalten"}</span>
              </button>
            )}

            {!isDataEntryPageActive && (
                <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                    <Filter className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
            )}
            {/* Logout Button Added Here */}
            {onLogout && (
                <button
                    onClick={onLogout}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center space-x-2"
                    title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
            )}
          </div>
        </div>

        {!isDataEntryPageActive && (
          <div className="flex items-center space-x-2 max-w-md"> {/* Modified: flex container for search and print */}
            <div className="relative flex-grow"> {/* Modified: search input takes available space */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Termine durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={handlePrintEvents}
              className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              title="Sichtbare Termine drucken"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
