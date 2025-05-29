import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react'; // Import icons

const DataEntryPage = () => {
  const [year, setYear] = useState('');
  const [events, setEvents] = useState([
    {
      id: '',
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'event',
      description: '',
      location: '',
    },
  ]);
  const [exceptionalDates, setExceptionalDates] = useState(['']);
  const [exceptionalTimespans, setExceptionalTimespans] = useState([{ start: '', end: '' }]);
  const [jsonDataToReview, setJsonDataToReview] = useState(null);

  // Standard input field classes for consistency
  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:text-white";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const buttonClasses = "px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const addButtonClasses = `${buttonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 flex items-center space-x-2`;
  const removeButtonClasses = `${buttonClasses} bg-red-500 hover:bg-red-600 focus:ring-red-500 flex items-center space-x-1 text-xs`;
  const actionButtonClasses = `${buttonClasses} bg-amber-500 hover:bg-amber-600 focus:ring-amber-400`;

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handleEventInputChange = (index, field, value) => {
    const updatedEvents = [...events];
    updatedEvents[index][field] = value;
    setEvents(updatedEvents);
  };

  const addEvent = () => {
    setEvents([
      ...events,
      {
        id: '',
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'event',
        description: '',
        location: '',
      },
    ]);
  };

  const removeEvent = (index) => {
    if (events.length > 1) {
      const updatedEvents = events.filter((_, i) => i !== index);
      setEvents(updatedEvents);
    }
  };

  const handleExceptionalDateChange = (index, value) => {
    const updatedExceptionalDates = [...exceptionalDates];
    updatedExceptionalDates[index] = value;
    setExceptionalDates(updatedExceptionalDates);
  };

  const addExceptionalDate = () => {
    setExceptionalDates([...exceptionalDates, '']);
  };

  const removeExceptionalDate = (index) => {
    if (exceptionalDates.length > 1 || (exceptionalDates.length === 1 && exceptionalDates[0] !== '')) {
      const updatedExceptionalDates = exceptionalDates.filter((_, i) => i !== index);
      if (updatedExceptionalDates.length === 0) {
          setExceptionalDates(['']);
      } else {
          setExceptionalDates(updatedExceptionalDates);
      }
    }
  };

  const handleExceptionalTimespanChange = (index, field, value) => {
    const updatedExceptionalTimespans = [...exceptionalTimespans];
    updatedExceptionalTimespans[index][field] = value;
    setExceptionalTimespans(updatedExceptionalTimespans);
  };

  const addExceptionalTimespan = () => {
    setExceptionalTimespans([...exceptionalTimespans, { start: '', end: '' }]);
  };

  const removeExceptionalTimespan = (index) => {
    if (exceptionalTimespans.length > 1 || 
        (exceptionalTimespans.length === 1 && (exceptionalTimespans[0].start !== '' || exceptionalTimespans[0].end !== ''))) {
      const updatedExceptionalTimespans = exceptionalTimespans.filter((_, i) => i !== index);
      if (updatedExceptionalTimespans.length === 0) {
          setExceptionalTimespans([{ start: '', end: '' }]);
      } else {
          setExceptionalTimespans(updatedExceptionalTimespans);
      }
    }
  };

  const handleReviewData = () => {
    if (!year.trim()) {
        alert('Bitte geben Sie ein gültiges Jahr ein.');
        setJsonDataToReview(null);
        return;
    }
    if (isNaN(Number(year))) {
      alert('Das Jahr muss eine Zahl sein.');
      setJsonDataToReview(null);
      return;
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event.id.trim() || !event.title.trim() || !event.date.trim() || !event.startTime.trim() || !event.endTime.trim()) {
        alert(`Bitte füllen Sie alle Pflichtfelder für Termin ${i + 1} korrekt aus (ID, Titel, Datum, Startzeit, Endzeit).`);
        setJsonDataToReview(null); return;
      }
      const datePattern = /^\d{4}-\d{2}-\d{2}$/; const timePattern = /^\d{2}:\d{2}$/;
      if (!datePattern.test(event.date)) { alert(`Ungültiges Datumsformat für Termin ${i + 1}. Bitte verwenden Sie JJJJ-MM-TT.`); setJsonDataToReview(null); return; }
      if (!timePattern.test(event.startTime) || !timePattern.test(event.endTime)) { alert(`Ungültiges Zeitformat für Termin ${i + 1}. Bitte verwenden Sie HH:MM.`); setJsonDataToReview(null); return; }
    }
    const filteredEvents = events.map(event => ({ ...event }));
    const filteredExceptionalDates = exceptionalDates.filter(date => date.trim() !== '');
    const filteredExceptionalTimespans = exceptionalTimespans.filter(ts => ts.start.trim() !== '' && ts.end.trim() !== '');
    const structuredData = { events: filteredEvents, exceptionalDates: filteredExceptionalDates, exceptionalTimespans: filteredExceptionalTimespans };
    setJsonDataToReview(structuredData); console.log('Strukturierte Daten zur Überprüfung:', structuredData); alert('Daten strukturiert und bereit zur Überprüfung (siehe Konsole).');
  };

  const handleDownloadJson = () => {
    if (!jsonDataToReview) { alert('Bitte überprüfen Sie zuerst die Daten!'); return; }
    if (!year.trim() || isNaN(Number(year))) { alert('Bitte stellen Sie sicher, dass ein gültiges Jahr festgelegt ist, bevor Sie herunterladen.'); return; }
    const jsonString = JSON.stringify(jsonDataToReview, null, 2); const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${year.trim()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">Dateneingabe</h1>

      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md">
        <label htmlFor="year" className={`${labelClasses} text-lg`}>Jahr:</label>
        <input
          type="text"
          id="year"
          name="year"
          placeholder="z.B. 2024"
          value={year}
          onChange={handleYearChange}
          className={`${inputClasses} max-w-xs text-lg`}
        />
      </div>

      {/* Events Section */}
      <section className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Termine</h2>
          <button type="button" onClick={addEvent} className={addButtonClasses}>
            <PlusCircle size={18} />
            <span>Termin hinzufügen</span>
          </button>
        </div>
        {events.map((event, index) => (
          <div key={`event-${index}`} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm space-y-4 bg-white dark:bg-slate-700/50 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor={`eventId-${index}`} className={labelClasses}>ID:</label><input type="text" id={`eventId-${index}`} name="id" placeholder="z.B. e1" value={event.id} onChange={(e) => handleEventInputChange(index, 'id', e.target.value)} className={inputClasses} /></div>
              <div><label htmlFor={`eventTitle-${index}`} className={labelClasses}>Titel:</label><input type="text" id={`eventTitle-${index}`} name="title" placeholder="Titel des Termins" value={event.title} onChange={(e) => handleEventInputChange(index, 'title', e.target.value)} className={inputClasses} /></div>
              <div><label htmlFor={`eventDate-${index}`} className={labelClasses}>Datum:</label><input type="date" id={`eventDate-${index}`} name="date" value={event.date} onChange={(e) => handleEventInputChange(index, 'date', e.target.value)} className={inputClasses} /></div>
              <div><label htmlFor={`eventStartTime-${index}`} className={labelClasses}>Startzeit:</label><input type="time" id={`eventStartTime-${index}`} name="startTime" value={event.startTime} onChange={(e) => handleEventInputChange(index, 'startTime', e.target.value)} className={inputClasses} /></div>
              <div><label htmlFor={`eventEndTime-${index}`} className={labelClasses}>Endzeit:</label><input type="time" id={`eventEndTime-${index}`} name="endTime" value={event.endTime} onChange={(e) => handleEventInputChange(index, 'endTime', e.target.value)} className={inputClasses} /></div>
              <div><label htmlFor={`eventType-${index}`} className={labelClasses}>Typ:</label><select id={`eventType-${index}`} name="type" value={event.type} onChange={(e) => handleEventInputChange(index, 'type', e.target.value)} className={inputClasses}><option value="event">Event</option><option value="rehearsal">Probe</option><option value="concert">Konzert</option><option value="other">Sonstiges</option></select></div>
              <div className="md:col-span-2"><label htmlFor={`eventDescription-${index}`} className={labelClasses}>Beschreibung:</label><textarea id={`eventDescription-${index}`} name="description" placeholder="Beschreibung des Termins" value={event.description} onChange={(e) => handleEventInputChange(index, 'description', e.target.value)} className={inputClasses} rows="3"></textarea></div>
              <div className="md:col-span-2"><label htmlFor={`eventLocation-${index}`} className={labelClasses}>Ort:</label><input type="text" id={`eventLocation-${index}`} name="location" placeholder="Ort des Termins" value={event.location} onChange={(e) => handleEventInputChange(index, 'location', e.target.value)} className={inputClasses} /></div>
            </div>
            {events.length > 1 && (
              <button type="button" onClick={() => removeEvent(index)} className={`${removeButtonClasses} absolute top-2 right-2`}>
                <Trash2 size={14} /> <span>Entfernen</span>
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Exceptional Dates Section */}
      <section className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Ausnahmetage</h2>
          <button type="button" onClick={addExceptionalDate} className={addButtonClasses}>
            <PlusCircle size={18} />
            <span>Ausnahmetag hinzufügen</span>
          </button>
        </div>
        {exceptionalDates.map((date, index) => (
          <div key={`exceptionalDate-${index}`} className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-md">
            <div className="flex-grow"><label htmlFor={`exceptionalDate-${index}`} className={labelClasses}>Datum:</label><input type="date" id={`exceptionalDate-${index}`} value={date} onChange={(e) => handleExceptionalDateChange(index, e.target.value)} className={inputClasses} /></div>
            {(exceptionalDates.length > 1 || date !== '') && (
              <button type="button" onClick={() => removeExceptionalDate(index)} className={`${removeButtonClasses} self-end mb-1`}>
                <Trash2 size={14} /> <span>Entfernen</span>
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Exceptional Timespans Section */}
      <section className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Ausnahmezeiträume</h2>
          <button type="button" onClick={addExceptionalTimespan} className={addButtonClasses}>
            <PlusCircle size={18} />
            <span>Ausnahmezeitraum hinzufügen</span>
          </button>
        </div>
        {exceptionalTimespans.map((timespan, index) => (
          <div key={`timespan-${index}`} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm space-y-4 bg-white dark:bg-slate-700/50 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor={`timespanStartDate-${index}`} className={labelClasses}>Startdatum:</label><input type="date" id={`timespanStartDate-${index}`} value={timespan.start} onChange={(e) => handleExceptionalTimespanChange(index, 'start', e.target.value)} className={inputClasses} /></div>
              <div><label htmlFor={`timespanEndDate-${index}`} className={labelClasses}>Enddatum:</label><input type="date" id={`timespanEndDate-${index}`} value={timespan.end} onChange={(e) => handleExceptionalTimespanChange(index, 'end', e.target.value)} className={inputClasses} /></div>
            </div>
            {(exceptionalTimespans.length > 1 || timespan.start !== '' || timespan.end !== '') && (
               <button type="button" onClick={() => removeExceptionalTimespan(index)} className={`${removeButtonClasses} absolute top-2 right-2`}>
                <Trash2 size={14} /> <span>Entfernen</span>
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8 p-4 border-t border-slate-200 dark:border-slate-700">
        <button type="button" onClick={handleReviewData} className={actionButtonClasses}>
          Daten überprüfen
        </button>
        <button type="button" onClick={handleDownloadJson} className={`${actionButtonClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`}>
          JSON herunterladen
        </button>
      </div>

      {jsonDataToReview && (
        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">JSON-Vorschau:</h3>
          <pre className="p-3 bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-md text-sm overflow-x-auto custom-scrollbar">
            {JSON.stringify(jsonDataToReview, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DataEntryPage;
