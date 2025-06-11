import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JsonYearlyDataRepository } from './JsonYearlyDataRepository.js';
import YearlyRawData from '../../domain/entities/YearlyRawData.js';
import AppConfig from '../../domain/entities/AppConfig.js'; // Used for type checking if needed, not directly by repo methods

// Mocking config.json for getAvailableYears and constructor check
// This path is relative to the JsonYearlyDataRepository.js file if it were doing the import.
// For the test, it's relative to the project root or how Vitest resolves it.
// Let's assume Vitest resolves this path correctly from project root for mocking.
const mockDefaultConfig = { availableYears: [2023, 2024, 2025] };
vi.mock('../../data/config.json', () => ({
  default: mockDefaultConfig,
}));

describe('JsonYearlyDataRepository', () => {
  let repository;
  const testYear = 2024;
  const testYearData = {
    events: [{ id: 'ev1', title: 'Event 1' }],
    exceptionalDates: [`${testYear}-01-01`],
    exceptionalTimespans: [{ start: `${testYear}-02-01`, end: `${testYear}-02-02` }],
  };

  beforeEach(() => {
    repository = new JsonYearlyDataRepository();
    vi.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console.warn during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});// Suppress console.error during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});// Suppress console.log during tests for saveYearlyData
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Clears spies and mocks
    vi.resetModules(); // Important for modules with static imports that are mocked
  });

  describe('getYearlyData', () => {
    it('should return YearlyRawData for an existing year', async () => {
      // Mock the dynamic import for testYear
      vi.dynamicImportSettled = false; // Reset for safety if other tests use it
      vi.mock(`../../data/${testYear}.json`, () => ({
          default: testYearData,
      }));

      const result = await repository.getYearlyData(testYear);
      expect(result).toBeInstanceOf(YearlyRawData);
      expect(result.year).toBe(testYear);
      expect(result.events).toEqual(testYearData.events);
      expect(result.exceptionalDates).toEqual(testYearData.exceptionalDates);
      expect(result.exceptionalTimespans).toEqual(testYearData.exceptionalTimespans);
    });

    it('should return null for a non-existing year (dynamic import throws)', async () => {
      const nonExistingYear = 2099;
      // Mock the dynamic import to throw an error
      vi.dynamicImportSettled = false;
      vi.mock(`../../data/${nonExistingYear}.json`, () => {
        throw new Error('File not found');
      });

      const result = await repository.getYearlyData(nonExistingYear);
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`Could not load or parse data for year ${nonExistingYear}`));
    });

    it('should return null for malformed JSON data', async () => {
      const malformedYear = 2026;
      const malformedData = { events: "not-an-array" }; // Invalid structure
       vi.dynamicImportSettled = false;
      vi.mock(`../../data/${malformedYear}.json`, () => ({
          default: malformedData,
      }));

      const result = await repository.getYearlyData(malformedYear);
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`Data file ${malformedYear}.json has unexpected structure`));
    });

    it('should return null if year is not a number', async () => {
        const result = await repository.getYearlyData("invalid-year");
        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith("JsonYearlyDataRepository.getYearlyData: Year must be an integer number.");
    });
  });

  describe('saveYearlyData', () => {
    it('should log data and resolve for valid inputs', async () => {
      const dataToSave = new YearlyRawData(testYear, [], [], []);
      await expect(repository.saveYearlyData(testYear, dataToSave)).resolves.toBeUndefined();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`Simulating save for year ${testYear}`));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Data to be "saved"'), expect.anything());
    });

    it('should return a rejected promise if year is invalid', async () => {
      const dataToSave = new YearlyRawData(testYear, [], [], []);
      await expect(repository.saveYearlyData(null, dataToSave)).rejects.toThrow("Year must be an integer number.");
    });

    it('should return a rejected promise if data is not a YearlyRawData instance', async () => {
      await expect(repository.saveYearlyData(testYear, {})).rejects.toThrow("Data must be an instance of YearlyRawData.");
    });
  });

  describe('getAvailableYears', () => {
    it('should return availableYears from mocked config.json', async () => {
      // config.json is mocked at the top of the file
      const result = await repository.getAvailableYears();
      expect(result).toEqual(mockDefaultConfig.availableYears.sort((a,b) => a - b));
    });

    it('should return an empty array and warn if configData is invalid (simulated by re-instantiating with bad mock)', async () => {
        // This test requires careful handling of mocks for static imports.
        // We need to reset modules to force re-import of config.json with a new mock.
        vi.resetModules();
        vi.mock('../../data/config.json', () => ({ default: { availableYears: "not-an-array" } })); // Invalid mock

        // Re-initialize repository to pick up the new (bad) mock for config.json
        // The constructor of JsonYearlyDataRepository itself might throw or warn here.
        // Let's catch constructor warning for this specific test.
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        new JsonYearlyDataRepository(); // Instantiate to trigger constructor logic with bad config.

        // If the constructor itself doesn't throw but warns, getAvailableYears will use the bad data.
        const repoWithBadConfig = new JsonYearlyDataRepository(); // Assuming constructor doesn't throw for this specific bad data
        const result = await repoWithBadConfig.getAvailableYears();

        expect(result).toEqual([]);
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Could not retrieve available years from config.json or data is invalid."));
        consoleWarnSpy.mockRestore();
    });
  });
});
