import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, ChevronDown, ChevronRight, Info } from 'lucide-react';

const generateEventId = () => `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const DataEntryPage = () => {
  const currentSystemYear = new Date().getFullYear().toString();
  const [year, setYear] = useState(currentSystemYear);
  
  const getDefaultDateForYear = () => `${year || currentSystemYear}-01-01`;

  const [events, setEvents] = useState([]); 
  const [exceptionalDates, setExceptionalDates] = useState([]); 
  const [exceptionalTimespans, setExceptionalTimespans] = useState([]); 
  
  const [jsonDataToReview, setJsonDataToReview] = useState(null);

  useEffect(() => {
    const newDefaultDate = getDefaultDateForYear();
    if (events.length > 0) {
        setEvents(prevEvents => 
            prevEvents.map(event => event.date === '' ? { ...event, date: newDefaultDate } : event)
        );
    }
    if (exceptionalDates.length > 0) {
        setExceptionalDates(prevDates => 
            prevDates.map(date => date === '' ? newDefaultDate : date)
        );
    }
    if (exceptionalTimespans.length > 0) {
        setExceptionalTimespans(prevTimespans =>
            prevTimespans.map(ts => 
                (ts.start === '' && ts.end === '') ? 
                { ...ts, start: newDefaultDate, end: newDefaultDate } : ts
            )
        );
    }
  }, [year]);

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:text-white";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  const buttonClasses = "px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const addButtonClasses = `${buttonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 flex items-center justify-center sm:justify-start space-x-0 sm:space-x-2`;
  const removeButtonBaseClasses = `${buttonClasses} bg-red-500 hover:bg-red-600 focus:ring-red-500 flex items-center text-xs`;
  const eventRemoveButtonClasses = `${removeButtonBaseClasses} space-x-1`; 
  const exceptionalRemoveButtonClasses = `${removeButtonBaseClasses} space-x-0 sm:space-x-1`; 
  const explanationTextClasses = "text-sm text-gray-600 dark:text-gray-400 mb-3 italic";
  
  const actionButtonClasses = `${buttonClasses} bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 w-full sm:w-auto`;

  const handleYearChange = (e) => setYear(e.target.value);

  const handleEventInputChange = (index, field, value) => {
    const updatedEvents = [...events];
    updatedEvents[index][field] = value;
    setEvents(updatedEvents);
  };

  const addEvent = () => {
    setEvents([...events, {
        id: generateEventId(), title: '', date: getDefaultDateForYear(), startTime: '', endTime: '',
        type: 'event', description: '', location: '', isCollapsed: events.length > 0, 
    }]);
  };

  const removeEvent = (indexToRemove) => {
    setEvents(events.filter((_, index) => index !== indexToRemove));
  };
  
  const toggleEventCollapse = (eventId) => {
    setEvents(prevEvents => prevEvents.map(event =>
        event.id === eventId ? { ...event, isCollapsed: !event.isCollapsed } : event
    ));
  };

  const handleExceptionalDateChange = (index, value) => {
    const updatedDates = [...exceptionalDates];
    updatedDates[index] = value;
    setExceptionalDates(updatedDates);
  };

  const addExceptionalDate = () => setExceptionalDates([...exceptionalDates, getDefaultDateForYear()]);

  const removeExceptionalDate = (indexToRemove) => {
    setExceptionalDates(exceptionalDates.filter((_, index) => index !== indexToRemove));
  };

  const handleExceptionalTimespanChange = (index, field, value) => {
    const updatedTimespans = [...exceptionalTimespans];
    updatedTimespans[index][field] = value;
    setExceptionalTimespans(updatedTimespans);
  };

  const addExceptionalTimespan = () => setExceptionalTimespans([
    ...exceptionalTimespans, 
    { 
      start: getDefaultDateForYear(), 
      end: getDefaultDateForYear(),
      isCollapsed: exceptionalTimespans.length > 0, 
    }
  ]);

  const removeExceptionalTimespan = (indexToRemove) => {
    setExceptionalTimespans(exceptionalTimespans.filter((_, index) => index !== indexToRemove));
  };

  const toggleTimespanCollapse = (index) => {
    setExceptionalTimespans(prevTimespans =>
      prevTimespans.map((ts, i) =>
        i === index ? { ...ts, isCollapsed: !ts.isCollapsed } : ts
      )
    );
  };

  const handleReviewData = () => {
    if (!year.trim() || isNaN(Number(year))) {
        alert(year.trim() ? 'Das Jahr muss eine Zahl sein.' : 'Bitte geben Sie ein gültiges Jahr ein.');
        setJsonDataToReview(null); return;
    }
    const selectedYearNumber = year.trim();
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event.title.trim() || !event.date.trim() || !event.startTime.trim() || !event.endTime.trim()) {
        alert(`Bitte füllen Sie alle Pflichtfelder für Termin ${i + 1} korrekt aus (Titel, Datum, Startzeit, Endzeit).`);
        setJsonDataToReview(null); return;
      }
      const datePattern = /^\d{4}-\d{2}-\d{2}$/; const timePattern = /^\d{2}:\d{2}$/;
      if (!datePattern.test(event.date)) { alert(`Ungültiges Datumsformat für Termin ${i + 1}. Bitte verwenden Sie JJJJ-MM-TT.`); setJsonDataToReview(null); return; }
      if (event.date.substring(0, 4) !== selectedYearNumber) {
        alert(`Das Jahr im Datum des Termins "${event.title || `Termin ${i+1}`}" (${event.date.substring(0,4)}) stimmt nicht mit dem ausgewählten Jahr (${selectedYearNumber}) überein.`);
        setJsonDataToReview(null); return;
      }
      if (!timePattern.test(event.startTime) || !timePattern.test(event.endTime)) { alert(`Ungültiges Zeitformat für Termin ${i + 1}. Bitte verwenden Sie HH:MM.`); setJsonDataToReview(null); return; }
    }
    for (const exDate of exceptionalDates) {
        if (exDate.trim() !== '' && exDate.substring(0, 4) !== selectedYearNumber) {
            alert(`Das Jahr im Ausnahmetag (${exDate.substring(0,4)}) stimmt nicht mit dem ausgewählten Jahr (${selectedYearNumber}) überein.`);
            setJsonDataToReview(null); return;
        }
    }
    for (const ts of exceptionalTimespans) {
        if (ts.start.trim() !== '' && ts.start.substring(0, 4) !== selectedYearNumber) {
            alert(`Das Jahr im Startdatum des Ausnahmezeitraums (${ts.start.substring(0,4)}) stimmt nicht mit dem ausgewählten Jahr (${selectedYearNumber}) überein.`);
            setJsonDataToReview(null); return;
        }
        if (ts.end.trim() !== '' && ts.end.substring(0, 4) !== selectedYearNumber) {
            alert(`Das Jahr im Enddatum des Ausnahmezeitraums (${ts.end.substring(0,4)}) stimmt nicht mit dem ausgewählten Jahr (${selectedYearNumber}) überein.`);
            setJsonDataToReview(null); return;
        }
    }
    const filteredEvents = events.map(({ isCollapsed, ...event }) => event); 
    const filteredExceptionalDates = exceptionalDates.filter(date => date.trim() !== '');
    const filteredExceptionalTimespans = exceptionalTimespans
        .filter(ts => ts.start.trim() !== '' && ts.end.trim() !== '')
        .map(({ isCollapsed, ...ts }) => ts); 
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
    <div className="space-y-6 p-2 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 text-center">Dateneingabe</h1>
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md">
        <label htmlFor="year" className={`${labelClasses} text-md sm:text-lg`}>Jahr:</label>
        <p className={`${explanationTextClasses} mt-0 mb-1 text-xs`}>(Jahr für das die Termine gelten)</p>
        <input type="text" id="year" name="year" placeholder="z.B. 2024" value={year} onChange={handleYearChange} className={`${inputClasses} max-w-full sm:max-w-xs text-md sm:text-lg`} />
      </div>

      <section className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">Termine</h2>
          <button type="button" onClick={addEvent} className={`${addButtonClasses} w-full sm:w-auto`}>
            <PlusCircle size={18} />
            <span className="sm:inline">Termin hinzufügen</span>
          </button>
        </div>
        <p className={explanationTextClasses}>(Events wie Auftritte oder Konzerte)</p>
        {events.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">Fügen Sie Termine hinzu</p>}
        {events.map((event, index) => (
          <div key={event.id} className="border border-slate-200 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-700/50">
            <div 
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50"
              onClick={() => toggleEventCollapse(event.id)}
            >
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm sm:text-base truncate pr-2">{event.title || `Neuer Termin ${index + 1}`}</h3>
              <div className="flex items-center flex-shrink-0">
                {event.isCollapsed ? <ChevronRight size={20} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeEvent(index); }} className={`${eventRemoveButtonClasses} ml-2 sm:ml-3`} title="Termin entfernen">
                  <Trash2 size={14} /> <span className="hidden sm:inline">Entfernen</span>
                </button>
              </div>
            </div>
            {!event.isCollapsed && (
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-600 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div><label htmlFor={`eventTitle-${event.id}`} className={labelClasses}>Titel:</label><input type="text" id={`eventTitle-${event.id}`} name="title" placeholder="Titel des Termins" value={event.title} onChange={(e) => handleEventInputChange(index, 'title', e.target.value)} className={inputClasses} /></div>
                  <div><label htmlFor={`eventDate-${event.id}`} className={labelClasses}>Datum:</label><input type="date" id={`eventDate-${event.id}`} name="date" value={event.date} onChange={(e) => handleEventInputChange(index, 'date', e.target.value)} className={inputClasses} /></div>
                  <div><label htmlFor={`eventStartTime-${event.id}`} className={labelClasses}>Startzeit:</label><input type="time" id={`eventStartTime-${event.id}`} name="startTime" value={event.startTime} onChange={(e) => handleEventInputChange(index, 'startTime', e.target.value)} className={inputClasses} /></div>
                  <div><label htmlFor={`eventEndTime-${event.id}`} className={labelClasses}>Endzeit:</label><input type="time" id={`eventEndTime-${event.id}`} name="endTime" value={event.endTime} onChange={(e) => handleEventInputChange(index, 'endTime', e.target.value)} className={inputClasses} /></div>
                  <div className="md:col-span-2"><label htmlFor={`eventDescription-${event.id}`} className={labelClasses}>Beschreibung:</label><textarea id={`eventDescription-${event.id}`} name="description" placeholder="Beschreibung des Termins" value={event.description} onChange={(e) => handleEventInputChange(index, 'description', e.target.value)} className={inputClasses} rows="3"></textarea></div>
                  <div className="md:col-span-2"><label htmlFor={`eventLocation-${event.id}`} className={labelClasses}>Ort:</label><input type="text" id={`eventLocation-${event.id}`} name="location" placeholder="Ort des Termins" value={event.location} onChange={(e) => handleEventInputChange(index, 'location', e.target.value)} className={inputClasses} /></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">Ausnahmetage</h2>
          <button type="button" onClick={addExceptionalDate} className={`${addButtonClasses} w-full sm:w-auto`}><PlusCircle size={18} /><span className="sm:inline">Ausnahmetag hinzufügen</span></button>
        </div>
        <p className={explanationTextClasses}>(Tage, an denen eine reguläre Chorprobe ausfällt)</p>
        {exceptionalDates.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">Fügen Sie Ausnahmetage hinzu</p>}
        {exceptionalDates.map((date, index) => (
          <div key={`exceptionalDate-${index}`} className="flex items-center space-x-2 sm:space-x-3 p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-md">
            <div className="flex-grow"><label htmlFor={`exceptionalDate-${index}`} className={`${labelClasses} sr-only`}>Datum:</label><input type="date" id={`exceptionalDate-${index}`} value={date} onChange={(e) => handleExceptionalDateChange(index, e.target.value)} className={inputClasses} /></div>
            <button type="button" onClick={() => removeExceptionalDate(index)} className={`${exceptionalRemoveButtonClasses} self-end mb-1`}><Trash2 size={14} /> <span className="hidden sm:inline">Entfernen</span></button>
          </div>
        ))}
      </section>

      <section className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">Ausnahmezeiträume</h2>
          <button type="button" onClick={addExceptionalTimespan} className={`${addButtonClasses} w-full sm:w-auto`}><PlusCircle size={18} /><span className="sm:inline">Ausnahmezeitraum hinzufügen</span></button>
        </div>
        <p className={explanationTextClasses}>(Längere Zeiträume in denen keine Proben stattfinden, z.B. Ferien)</p>
        {exceptionalTimespans.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">Fügen Sie Ausnahmezeiträume hinzu</p>}
        {exceptionalTimespans.map((timespan, index) => (
          <div key={`timespan-${index}`} className="border border-slate-200 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-700/50">
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/50"
              onClick={() => toggleTimespanCollapse(index)}
            >
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm sm:text-base truncate pr-2">
                {timespan.start && timespan.end ? `Zeitraum: ${timespan.start} - ${timespan.end}` : `Neuer Ausnahmezeitraum ${index + 1}`}
              </h3>
              <div className="flex items-center flex-shrink-0">
                {timespan.isCollapsed ? <ChevronRight size={20} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeExceptionalTimespan(index); }} className={`${exceptionalRemoveButtonClasses} ml-4 sm:ml-6`} title="Ausnahmezeitraum entfernen">
                  <Trash2 size={14} /> <span className="hidden sm:inline">Entfernen</span>
                </button>
              </div>
            </div>
            {!timespan.isCollapsed && (
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-600 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div><label htmlFor={`timespanStartDate-${index}`} className={labelClasses}>Startdatum:</label><input type="date" id={`timespanStartDate-${index}`} value={timespan.start} onChange={(e) => handleExceptionalTimespanChange(index, 'start', e.target.value)} className={inputClasses} /></div>
                  <div><label htmlFor={`timespanEndDate-${index}`} className={labelClasses}>Enddatum:</label><input type="date" id={`timespanEndDate-${index}`} value={timespan.end} onChange={(e) => handleExceptionalTimespanChange(index, 'end', e.target.value)} className={inputClasses} /></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 p-4 border-t border-slate-200 dark:border-slate-700">
        <button type="button" onClick={handleReviewData} className={actionButtonClasses}>Daten überprüfen</button>
        <button type="button" onClick={handleDownloadJson} className={`${actionButtonClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`}>JSON herunterladen</button>
      </div>

      {jsonDataToReview && (
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shadow">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">JSON-Vorschau:</h3>
          <pre className="p-2 sm:p-3 bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-md text-xs sm:text-sm overflow-x-auto custom-scrollbar">{JSON.stringify(jsonDataToReview, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8 sm:mt-12 p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto p-3 sm:p-4 bg-blue-50 dark:bg-slate-800 rounded-lg shadow-md text-xs sm:text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <Info size={20} className="flex-shrink-0 mt-0.5" />
            <p>
              <strong>Wichtiger Hinweis:</strong> Nachdem Sie die JSON-Datei heruntergeladen haben, senden Sie diese bitte per E-Mail an den Administrator ([Admin E-Mail Adresse] oder die bekannte Admin E-Mail Adresse), damit die Termine in den Hauptkalender eingepflegt werden können. Vielen Dank!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEntryPage;
