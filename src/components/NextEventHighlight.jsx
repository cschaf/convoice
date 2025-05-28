import React from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react'; // Replaced Download with Calendar
import {
  getTerminIcon,
  getTerminColor,
  getTerminAccent,
  formatDate,
  getDaysUntilTermin
} from '../utils/helpers.jsx';

const NextEventHighlight = ({
  nextTermin,
  // getTerminColor, // Removed
  // getTerminAccent, // Removed
  // getTerminIcon, // Removed
  // formatDate, // Removed
  // getDaysUntilTermin, // Removed
  onDownloadICS
}) => {
  // The conditional rendering (nextTermin && timeFilter === 'upcoming')
  // will be handled in ConVoiceApp.jsx. This component assumes nextTermin is provided.
  // The conditional rendering (nextTermin && timeFilter === 'upcoming')
  // will be handled in ConVoiceApp.jsx. This component assumes nextTermin is provided.
  if (!nextTermin) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Nächster Termin</h2>
      <div className={`p-6 rounded-xl border-2 ${getTerminColor(nextTermin.type)} shadow-lg ring-2 ring-amber-200 transform hover:scale-105 transition-transform duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${getTerminAccent(nextTermin.type)} bg-white`}>
              {getTerminIcon(nextTermin.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{nextTermin.title}</h3>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                  Nächster Termin
                </span>
              </div>
              <p className="text-gray-600 mb-2">{formatDate(nextTermin.date)}</p>
              {nextTermin.startTime && (
                <div className="flex items-center text-gray-500 mb-2">
                  <Clock className="w-4 h-4 mr-1" />
                  {nextTermin.startTime} - {nextTermin.endTime}
                </div>
              )}
              {nextTermin.location && (
                <div className="flex items-center text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {nextTermin.location}
                </div>
              )}
              <p className="text-gray-700">{nextTermin.description}</p>
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={() => onDownloadICS(nextTermin)}
              className="mb-4 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-amber-600 hover:text-amber-700"
              title="Zu Kalender hinzufügen"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <div className="text-2xl font-bold text-amber-600">
              {getDaysUntilTermin(nextTermin.date)} Tage
            </div>
            <div className="text-sm text-gray-500">bis zum Termin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextEventHighlight;
