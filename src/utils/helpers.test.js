import { describe, it, expect } from 'vitest';
import { formatDate } from './helpers.jsx';

describe('formatDate', () => {
    it('Test Case 1: should correctly display Tuesday', () => {
        const dateString = '2025-01-07'; // Known Tuesday
        const formattedDate = formatDate(dateString);
        expect(formattedDate.startsWith('Dienstag')).toBe(true);
        expect(formattedDate).toBe('Dienstag, 7. Januar 2025');
    });

    it('Test Case 2: should correctly display Monday', () => {
        const dateString = '2025-01-06'; // Known Monday
        const formattedDate = formatDate(dateString);
        expect(formattedDate.startsWith('Montag')).toBe(true);
        expect(formattedDate).toBe('Montag, 6. Januar 2025');
    });

    it('Test Case 3: should correctly display a date before potential DST change (Tuesday)', () => {
        const dateString = '2025-10-28'; // Known Tuesday
        const formattedDate = formatDate(dateString);
        expect(formattedDate.startsWith('Dienstag')).toBe(true);
        expect(formattedDate).toBe('Dienstag, 28. Oktober 2025');
    });

    it('Test Case 4: should correctly display a date after potential DST change (Tuesday)', () => {
        const dateString = '2025-11-04'; // Known Tuesday
        const formattedDate = formatDate(dateString);
        expect(formattedDate.startsWith('Dienstag')).toBe(true);
        expect(formattedDate).toBe('Dienstag, 4. November 2025');
    });

    it('Test Case 5: should correctly format a date at the end of a month', () => {
        const dateString = '2025-03-31'; // Known Monday
        const formattedDate = formatDate(dateString);
        expect(formattedDate.startsWith('Montag')).toBe(true);
        expect(formattedDate).toBe('Montag, 31. März 2025');
    });

    it('Test Case 6: should correctly format a date at the beginning of a month', () => {
        const dateString = '2025-04-01'; // Known Tuesday
        const formattedDate = formatDate(dateString);
        expect(formattedDate.startsWith('Dienstag')).toBe(true);
        expect(formattedDate).toBe('Dienstag, 1. April 2025');
    });
});
