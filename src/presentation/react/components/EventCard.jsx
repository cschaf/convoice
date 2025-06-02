import React from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react'; // Calendar was updated in a previous task
import {
  getTerminIcon,
  getTerminColor,
  getTerminAccent,
  formatDate,
  isTerminPast,
  getDaysUntilTermin
} from '../utils/helpers.jsx';

const EventCard = ({
  termin,
  onDownloadICS
}) => {
  const isPast = isTerminPast(termin.date);
  // JSX for the event card will go here
  return (
    <div
      className={`p-6 rounded-lg border-l-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 ${
        getTerminColor(termin.type) // Provides light mode border-XXX-500 and bg-XXX-50
      } dark:bg-slate-800 dark:shadow-lg dark:shadow-slate-700/50 dark:hover:shadow-xl ${
        termin.type === 'chorprobe' ? 'dark:border-blue-700' :
        termin.type === 'event' ? 'dark:border-amber-700' :
        termin.type === 'geburtstag' ? 'dark:border-pink-700' :
        'dark:border-gray-600'
      } ${isPast ? 'opacity-60 dark:opacity-70' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          // Light mode background/text from getTerminAccent, dark mode specific background and icon text color
          termin.type === 'chorprobe' ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' :
          termin.type === 'event' ? 'bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-300' :
          termin.type === 'geburtstag' ? 'bg-pink-100 text-pink-600 dark:bg-pink-800 dark:text-pink-300' :
          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        } ${isPast ? 'opacity-50' : ''}`}>
          {getTerminIcon(termin.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold text-gray-900 dark:text-slate-100 ${isPast ? 'line-through' : ''}`}>
              {termin.title}
            </h3>
            <button
              onClick={() => onDownloadICS(termin)}
              className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                // Light mode text from getTerminAccent, dark mode specific text color
                termin.type === 'chorprobe' ? 'text-blue-600 dark:text-blue-400' :
                termin.type === 'event' ? 'text-amber-600 dark:text-amber-400' :
                termin.type === 'geburtstag' ? 'text-pink-600 dark:text-pink-400' :
                'text-gray-600 dark:text-gray-400'
              } ${isPast ? 'opacity-50' : ''}`}
              title="Zu Kalender hinzufügen"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
            {formatDate(termin.date)}
          </p>
          {termin.startTime && (
            <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              {termin.startTime} - {termin.endTime}
            </div>
          )}
          {termin.location && (
            <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {termin.location}
            </div>
          )}
          <p className="text-sm text-gray-700 dark:text-slate-300">{termin.description}</p>
          {!isPast && (
            <div className="mt-2 text-xs text-gray-500 dark:text-slate-500">
              in {getDaysUntilTermin(termin.date)} Tagen
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
