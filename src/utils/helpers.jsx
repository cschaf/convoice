import React from 'react'; // Added React import for JSX in getTerminIcon
import { Music, Star, Cake, Calendar } from 'lucide-react';

export const getTerminIcon = (type, className = 'w-6 h-6') => {
    switch (type) {
        case 'chorprobe': return <Music className={className} />;
        case 'event': return <Star className={className} />;
        case 'geburtstag': return <Cake className={className} />;
        default: return <Calendar className={className} />;
    }
};

export const getTerminColor = (type) => {
    switch (type) {
        case 'chorprobe': return 'border-blue-500 bg-blue-50';
        case 'event': return 'border-amber-500 bg-amber-50';
        case 'geburtstag': return 'border-pink-500 bg-pink-50';
        default: return 'border-gray-500 bg-gray-50';
    }
};

export const getTerminAccent = (type) => {
    switch (type) {
        case 'chorprobe': return 'text-blue-600';
        case 'event': return 'text-amber-600';
        case 'geburtstag': return 'text-pink-600';
        default: return 'text-gray-600';
    }
};

export const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const isTerminPast = (dateStr) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    return dateStr < today;
};

export const getDaysUntilTermin = (dateStr) => {
    // Today, normalized to the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Event Date, parsed from "YYYY-MM-DD" and normalized
    // It's important to parse the date string components to avoid timezone issues
    // with `new Date(string)` which can vary based on string format and browser.
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(parts[2], 10);
    
    const eventDate = new Date(year, month, day);
    eventDate.setHours(0, 0, 0, 0); // Ensures it's at the start of the day in local timezone

    // Calculate the difference in milliseconds
    const diffInMilliseconds = eventDate.getTime() - today.getTime();

    // Convert the difference to days
    // Math.round is used to correctly categorize events happening "today" or "tomorrow"
    const daysUntil = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
        return "Vorbei";
    } else if (daysUntil === 0) {
        return "Heute";
    } else if (daysUntil === 1) {
        return "Morgen";
    } else {
        return `${daysUntil} Tage`;
    }
};
