import { describe, it, expect } from 'vitest';
import { getYearlyData } from './yearlyDataLoader.js'; // Updated import

describe('getYearlyData', () => {
  describe('Successful loading', () => {
    it('should correctly load and return content for an existing year (2025)', async () => {
      const data = await getYearlyData(2025); // Changed function call

      expect(data).toBeTypeOf('object');
      
      // Events
      expect(data.events).toBeInstanceOf(Array);
      // Check against the known number of events in 2025.json from Subtask 10
      expect(data.events.length).toBe(5); 
      expect(data.events[0]).toHaveProperty('id'); 
      expect(data.events[0].id).toBe('e1');
      
      // Exceptional Dates
      expect(data.exceptionalDates).toBeInstanceOf(Array);
      expect(data.exceptionalDates.length).toBe(3); 
      expect(data.exceptionalDates).toContain('2025-01-28');
      
      // Exceptional Timespans
      expect(data.exceptionalTimespans).toBeInstanceOf(Array);
      expect(data.exceptionalTimespans.length).toBe(3); 
      expect(data.exceptionalTimespans).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ start: '2025-07-07', end: '2025-07-29' }),
          expect.objectContaining({ start: '2025-10-13', end: '2025-10-25' }),
          expect.objectContaining({ start: '2025-12-22', end: '2026-01-05' })
        ])
      );
    });
  });

  describe('File not found (graceful handling)', () => {
    it('should return an object with empty arrays for events, exceptionalDates, and exceptionalTimespans for a non-existent year (e.g., 2077)', async () => {
      const data = await getYearlyData(2077); // Changed function call
      expect(data).toEqual({
        events: [],
        exceptionalDates: [],
        exceptionalTimespans: [],
      });
    });

    it('should return an object with empty arrays for a year that was deleted (2024)', async () => {
      // 2024.json was deleted in Subtask 10, so it should behave as file not found.
      const data = await getYearlyData(2024); // Changed function call
      expect(data).toEqual({
        events: [],
        exceptionalDates: [],
        exceptionalTimespans: [],
      });
    });
  });

  describe('Empty or partially empty file content', () => {
    it('should return an object with empty arrays for events, exceptionalDates, and exceptionalTimespans for a year with an empty definition (2026)', async () => {
      // 2026.json was created in Subtask 10 with all empty arrays.
      const data = await getYearlyData(2026); // Changed function call
      expect(data).toEqual({
        events: [],
        exceptionalDates: [],
        exceptionalTimespans: [],
      });
    });
  });
});
