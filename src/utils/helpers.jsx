import React from 'react'; // Added React import for JSX in getTerminIcon
import { Music, Star, Cake, Calendar } from 'lucide-react';

export const getTerminIcon = (type) => {
    switch (type) {
        case 'chorprobe': return <Music className="w-5 h-5" />;
        case 'event': return <Star className="w-5 h-5" />;
        case 'geburtstag': return <Cake className="w-5 h-5" />;
        default: return <Calendar className="w-5 h-5" />;
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
    const now = new Date();
    const terminDate = new Date(dateStr);
    const diffTime = terminDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
