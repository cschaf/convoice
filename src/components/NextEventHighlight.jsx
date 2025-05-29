import React from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';
import {
  getTerminIcon,
  getTerminColor,
  getTerminAccent,
  formatDate,
  getDaysUntilTermin
} from '../utils/helpers.jsx';

const NextEventHighlight = ({
  nextEvents, // Changed from nextTermin to nextEvents
  onDownloadICS
}) => {
  if (!nextEvents || nextEvents.length === 0) {
    return null;
  }

  const isSingleEvent = nextEvents.length === 1;
  const displayEvent = nextEvents[0]; // Primary event for common data

  const daysDisplayString = getDaysUntilTermin(displayEvent.date);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
        {isSingleEvent ? "Nächster Termin" : `Termine am ${formatDate(displayEvent.date)}`}
      </h2>
      <div className={`p-6 rounded-xl border-2 ${
        getTerminColor(displayEvent.type) // Use displayEvent
      } dark:bg-slate-800 ${
        displayEvent.type === 'chorprobe' ? 'dark:border-blue-700' :
        displayEvent.type === 'event' ? 'dark:border-amber-700' :
        displayEvent.type === 'geburtstag' ? 'dark:border-pink-700' :
        'dark:border-gray-600'
      } shadow-lg dark:shadow-lg dark:shadow-slate-700/50 ring-2 ring-amber-200 dark:ring-amber-600 transform hover:scale-105 transition-transform duration-200`}>
        <div className="flex items-start justify-between">
          {/* Left side: Main Icon and Content */}
          <div className="flex items-start space-x-4 flex-1">
            {isSingleEvent && (
              <div className={`p-3 rounded-full ${
                getTerminAccent(displayEvent.type) // Use displayEvent
              } ${ 
                displayEvent.type === 'chorprobe' ? 'dark:text-blue-400' :
                displayEvent.type === 'event' ? 'dark:text-amber-400' :
                displayEvent.type === 'geburtstag' ? 'dark:text-pink-400' :
                'dark:text-gray-400'
              } bg-white dark:bg-slate-700`}>
                {getTerminIcon(displayEvent.type)} {/* Default size (w-6 h-6 from helper) */}
              </div>
            )}
            <div className="flex-1">
              {isSingleEvent ? (
                // JSX for Single Event Detail
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{displayEvent.title}</h3>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-xs font-medium rounded-full">
                      Nächster Termin
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 mb-2">{formatDate(displayEvent.date)}</p>
                  {displayEvent.startTime && (
                    <div className="flex items-center text-gray-500 dark:text-slate-400 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      {displayEvent.startTime} - {displayEvent.endTime}
                    </div>
                  )}
                  {displayEvent.location && (
                    <div className="flex items-center text-gray-500 dark:text-slate-400 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {displayEvent.location}
                    </div>
                  )}
                  <p className="text-gray-700 dark:text-slate-300">{displayEvent.description}</p>
                </>
              ) : (
                // JSX for Multiple Event List
                <>
                  {/* Title for multiple events is now part of the main H2 */}
                  {nextEvents.map((event, index) => (
                    <div key={index} className={`mb-3 p-3 rounded-md bg-white/60 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 ${index === nextEvents.length -1 ? '' : 'mb-4'}`}>
                      <div className="flex items-center mb-1">
                        <span className={`mr-2 ${getTerminAccent(event.type)}`}>{getTerminIcon(event.type, 'w-5 h-5')}</span>
                        <h4 className="font-semibold text-gray-800 dark:text-slate-200">{event.title}</h4>
                      </div>
                      {event.startTime && (
                        <p className="text-sm text-gray-600 dark:text-slate-400 ml-7">{event.startTime} - {event.endTime}</p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 ml-7">{event.location}</p>
                      )}
                      {/* Optional: event.description - decided against for brevity here */}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          {/* Right side: ICS Download and Days Until (common) */}
          <div className="text-right flex-shrink-0 pl-4">
            {isSingleEvent && (
              <button
                onClick={() => onDownloadICS(displayEvent)} // Use displayEvent
                className="mb-4 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                title="Zu Kalender hinzufügen"
              >
                <Calendar className="w-5 h-5" />
              </button>
            )}
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {daysDisplayString}
            </div>
            {!(daysDisplayString === "Heute" || daysDisplayString === "Morgen" || daysDisplayString === "Vorbei") && (
              <div className="text-sm text-gray-500 dark:text-slate-500">bis zum Termin</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextEventHighlight;
