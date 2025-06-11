import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JsonYearlyDataRepository } from './JsonYearlyDataRepository.js';
import YearlyRawData from '../../domain/entities/YearlyRawData.js';
import AppConfig from '../../domain/entities/AppConfig.js'; // Used for type checking if needed, not directly by repo methods

// Mocking config.json for getAvailableYears and constructor check
// This path is relative to the JsonYearlyDataRepository.js file if it were doing the import.
// For the test, it's relative to the project root or how Vitest resolves it.
// Let's assume Vitest resolves this path correctly from project root for mocking.
// const mockDefaultConfig = { availableYears: [2023, 2024, 2025] }; // Define inside factory
vi.mock('../../data/config.json', () => ({
  default: { availableYears: [2023, 2024, 2025] }, // Define directly
}));

describe('JsonYearlyDataRepository', () => {
  // Note: 'repository' will be initialized in beforeEach for each test.
  // const testYear and testYearData are fine here as they are used by vi.doMock factories.
  const testYear = 2024;
  const testYearData = {
    events: [{ id: 'ev1', title: 'Event 1' }],
    exceptionalDates: [`${testYear}-01-01`],
    exceptionalTimespans: [{ start: `${testYear}-02-01`, end: `${testYear}-02-02` }],
  };

  beforeEach(async () => {
    // Reset modules before each test to ensure fresh imports with specific mocks
    vi.resetModules();
    // Re-apply the global mock for config.json as it's reset by resetModules
    // This is needed if any test relies on it without its own vi.doMock for config.json
    vi.doMock('../../data/config.json', () => ({ default: { availableYears: [2023, 2024, 2025] } }));

    // Dynamically import and create repository instance for each test
    // This 'repository' instance will be used by tests unless they need a very specific setup.
    const { JsonYearlyDataRepository: Repo } = await import('./JsonYearlyDataRepository.js');
    // repository = new Repo(); // Assign to a shared variable if needed by multiple tests with this setup

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
      vi.resetModules(); // Ensure clean state for mocks
      // Mock the dynamic import for testYear
      vi.doMock(`../../data/${testYear}.json`, () => ({
          default: testYearData,
      }));
      // Mock config.json again because vi.resetModules() clears it.
      vi.doMock('../../data/config.json', () => ({ default: { availableYears: [2023, 2024, 2025] } }));


      const { JsonYearlyDataRepository: Repo } = await import('./JsonYearlyDataRepository.js?v=existingYear');
      const repository = new Repo();
      const result = await repository.getYearlyData(testYear);

      const { default: YearlyRawDataEntity } = await import('../../domain/entities/YearlyRawData.js?v=existingYearCheck');
      expect(result).toBeInstanceOf(YearlyRawDataEntity);
      expect(result.year).toBe(testYear);
      expect(result.events).toEqual(testYearData.events);
      expect(result.exceptionalDates).toEqual(testYearData.exceptionalDates);
      expect(result.exceptionalTimespans).toEqual(testYearData.exceptionalTimespans);
    });

    it('should return null for a non-existing year (dynamic import throws)', async () => {
      vi.resetModules();
      const nonExistingYear = 2099;
      // Mock the dynamic import to throw an error
      vi.doMock(`../../data/${nonExistingYear}.json`, () => {
        throw new Error('File not found');
      });
      vi.doMock('../../data/config.json', () => ({ default: { availableYears: [2023, 2024, 2025] } }));


      const { JsonYearlyDataRepository: Repo } = await import('./JsonYearlyDataRepository.js?v=nonExistingYear');
      const repository = new Repo();
      const result = await repository.getYearlyData(nonExistingYear);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`Could not load or parse data for year ${nonExistingYear}`));
    });

    it('should return null for malformed JSON data', async () => {
      vi.resetModules();
      const malformedYear = 2026;
      const malformedData = { events: "not-an-array" }; // Invalid structure
      vi.doMock(`../../data/${malformedYear}.json`, () => ({
          default: malformedData,
      }));
      vi.doMock('../../data/config.json', () => ({ default: { availableYears: [2023, 2024, 2025] } }));

      const { JsonYearlyDataRepository: Repo } = await import('./JsonYearlyDataRepository.js?v=malformedJson');
      const repository = new Repo();
      const result = await repository.getYearlyData(malformedYear);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(`Data file ${malformedYear}.json has unexpected structure`),
        expect.anything() // Acknowledge the second argument (the data object)
      );
    });

    it('should return null if year is not a number', async () => {
        // This test doesn't involve dynamic imports of year data, so default repo from beforeEach might be okay
        // However, to be consistent and safe with vi.resetModules() in global afterEach:
        vi.resetModules();
        vi.doMock('../../data/config.json', () => ({ default: { availableYears: [2023, 2024, 2025] } }));
        const { JsonYearlyDataRepository: Repo } = await import('./JsonYearlyDataRepository.js?v=yearNotNumber');
        const repository = new Repo();

        const result = await repository.getYearlyData("invalid-year");
        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith("JsonYearlyDataRepository.getYearlyData: Year must be an integer number.");
    });
  });

  describe('saveYearlyData', () => {
    // These tests use the 'repository' instance from beforeEach, which should be fine
    // as they don't rely on specific dynamic import mocks for year data files.
    // But ensure 'repository' is initialized freshly due to global afterEach > resetModules.
    let currentRepository;
    beforeEach(async () => {
        vi.resetModules();
        vi.doMock('../../data/config.json', () => ({ default: { availableYears: [2023, 2024, 2025] } }));
        const { JsonYearlyDataRepository: Repo } = await import('./JsonYearlyDataRepository.js?v=saveData');
        currentRepository = new Repo();
    });

    it('should log data and resolve for valid inputs', async () => {
      const { default: YearlyRawDataEntity } = await import('../../domain/entities/YearlyRawData.js?v=saveDataCheck');
      const dataToSave = new YearlyRawDataEntity(testYear, [], [], []);
      await expect(currentRepository.saveYearlyData(testYear, dataToSave)).resolves.toBeUndefined();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`Simulating save for year ${testYear}`));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Data to be "saved"'), expect.anything());
    });

    it('should return a rejected promise if year is invalid', async () => {
      const { default: YearlyRawDataEntity } = await import('../../domain/entities/YearlyRawData.js?v=saveDataInvalidYear');
      const dataToSave = new YearlyRawDataEntity(testYear, [], [], []);
      await expect(currentRepository.saveYearlyData(null, dataToSave)).rejects.toThrow("Year must be an integer number.");
    });

    it('should return a rejected promise if data is not a YearlyRawData instance', async () => {
      await expect(currentRepository.saveYearlyData(testYear, {})).rejects.toThrow("Data must be an instance of YearlyRawData.");
    });
  });

  describe('getAvailableYears', () => {
    it('should return availableYears from mocked config.json', async () => {
      vi.resetModules();
      // This ensures the global mock for config.json is used if JsonYearlyDataRepository is imported now.
      vi.doMock('../../data/config.json', () => ({ default: { availableYears: [2023, 2024, 2025] } }));
      const { JsonYearlyDataRepository: Repo } = await import('./JsonYearlyDataRepository.js?v=getAvailable');
      const repository = new Repo();
      const result = await repository.getAvailableYears();
      expect(result).toEqual([2023, 2024, 2025].sort((a,b) => a - b)); // Use literal for safety
    });

    it('should return an empty array and warn if configData is invalid (simulated by re-instantiating with bad mock)', async () => {
        vi.resetModules(); // Crucial: reset modules to apply a fresh mock for config.json
        // Mock config.json to be invalid for THIS test case
        vi.doMock('../../data/config.json', () => ({ default: { availableYears: "not-an-array" } }));

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Dynamically import the repository; it will use the mock defined by vi.doMock
        const { JsonYearlyDataRepository: RepoWithBadConfig } = await import('./JsonYearlyDataRepository.js?v=getAvailableBad');

        // Instantiation of the repository might trigger a console.warn if the constructor checks config
        const repoInstance = new RepoWithBadConfig();
        const result = await repoInstance.getAvailableYears(); // Call the method to test

        expect(result).toEqual([]);
        // Check if the specific warning from getAvailableYears was called.
        // The constructor also warns, so we might get multiple warnings.
        // For this test, we are interested in the warning from getAvailableYears itself.
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Could not retrieve available years from config.json or data is invalid."));
        // No need to restore consoleWarnSpy here if afterEach handles vi.restoreAllMocks()
    });
  });
});
