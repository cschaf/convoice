import React from 'react';
import { Clock, MapPin, Download } from 'lucide-react';
import {
  getTerminIcon,
  getTerminColor,
  getTerminAccent,
  formatDate,
  isTerminPast,
  getDaysUntilTermin
} from '../utils/helpers';

const EventCard = ({
  termin,
  // getTerminColor, // Removed
  // getTerminAccent, // Removed
  // getTerminIcon, // Removed
  // formatDate, // Removed
  // isTerminPast, // Removed
  // getDaysUntilTermin, // Removed
  onDownloadICS
}) => {
  const isPast = isTerminPast(termin.date);
  // JSX for the event card will go here
  return (
    <div
      className={`p-6 rounded-lg border-l-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 ${
        getTerminColor(termin.type)
      } ${isPast ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${getTerminAccent(termin.type)} ${isPast ? 'opacity-50' : ''}`}>
          {getTerminIcon(termin.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold text-gray-900 ${isPast ? 'line-through' : ''}`}>
              {termin.title}
            </h3>
            <button
              onClick={() => onDownloadICS(termin)}
              className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 ${getTerminAccent(termin.type)} ${isPast ? 'opacity-50' : ''}`}
              title="Zu Kalender hinzufügen"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {formatDate(termin.date)}
          </p>
          {termin.startTime && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              {termin.startTime} - {termin.endTime}
            </div>
          )}
          {termin.location && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {termin.location}
            </div>
          )}
          <p className="text-sm text-gray-700">{termin.description}</p>
          {!isPast && (
            <div className="mt-2 text-xs text-gray-500">
              in {getDaysUntilTermin(termin.date)} Tagen
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
