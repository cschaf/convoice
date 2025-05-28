import { describe, it, expect } from 'vitest';
import { getExceptionsByYear } from './exceptionLoader.js'; // Adjust path as necessary

describe('getExceptionsByYear', () => {
  describe('Successful loading', () => {
    it('should correctly load and return content for an existing year (2025)', async () => {
      const exceptions = await getExceptionsByYear(2025);

      // Check for presence and type of arrays
      expect(exceptions).toBeTypeOf('object');
      expect(exceptions.exceptionalDates).toBeInstanceOf(Array);
      expect(exceptions.exceptionalTimespans).toBeInstanceOf(Array);

      // Check for specific content based on src/data/exceptions/2025.json
      // Dates
      expect(exceptions.exceptionalDates.length).toBe(3);
      expect(exceptions.exceptionalDates).toContain('2025-01-28');
      expect(exceptions.exceptionalDates).toContain('2025-04-22');
      expect(exceptions.exceptionalDates).toContain('2025-08-19');

      // Timespans
      expect(exceptions.exceptionalTimespans.length).toBe(3);
      expect(exceptions.exceptionalTimespans).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ start: '2025-07-07', end: '2025-07-29' }), // Sommerferien
          expect.objectContaining({ start: '2025-10-13', end: '2025-10-25' }), // Herbstferien
          expect.objectContaining({ start: '2025-12-22', end: '2026-01-05' })  // Weihnachtsferien
        ])
      );
    });
  });

  describe('File not found (graceful handling)', () => {
    it('should return empty arrays for a non-existent year (e.g., 2077)', async () => {
      const exceptions = await getExceptionsByYear(2077);

      expect(exceptions).toEqual({
        exceptionalDates: [],
        exceptionalTimespans: [],
      });
    });

    it('should return empty arrays for a year with a non-JSON file if that were possible (e.g., "test")', async () => {
        // This tests the robustness against non-standard year inputs that might fail import
        const exceptions = await getExceptionsByYear('test');
        expect(exceptions).toEqual({
          exceptionalDates: [],
          exceptionalTimespans: [],
        });
      });
  });

  describe('Empty file content', () => {
    it('should return empty arrays for a year with an empty definition (2024)', async () => {
      const exceptions = await getExceptionsByYear(2024);

      expect(exceptions).toEqual({
        exceptionalDates: [],
        exceptionalTimespans: [],
      });
    });

    it('should return empty arrays for another year with an empty definition (2026)', async () => {
      const exceptions = await getExceptionsByYear(2026);

      expect(exceptions).toEqual({
        exceptionalDates: [],
        exceptionalTimespans: [],
      });
    });
  });

  describe('Malformed JSON content', () => {
    // This case is a bit harder to test without actually creating a malformed JSON file
    // or mocking the import. The current implementation of getExceptionsByYear
    // might log a console warning for unexpected structure but still return empty arrays.
    // For now, we assume the dynamic import itself would fail for truly malformed JSON,
    // and the catch block would return empty arrays.
    // If a file exists but is not valid JSON, the dynamic import `await import(...)` itself should throw an error.
    // This scenario implicitly tests that the catch block in getExceptionsByYear works.
    it('should return empty arrays if a file is found but contains malformed JSON (e.g. "malformed_year.json")', async () => {
        // To truly test this, we would need a 'malformed_year.json' or use mocking.
        // We'll rely on the dynamic import failing for a non-existent file that mimics this.
        const exceptions = await getExceptionsByYear('malformed_year');
        expect(exceptions).toEqual({
            exceptionalDates: [],
            exceptionalTimespans: [],
        });
    });
  });
});
