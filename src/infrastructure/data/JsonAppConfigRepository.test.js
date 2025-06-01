import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JsonAppConfigRepository } from './JsonAppConfigRepository.js';
import AppConfig from '../../domain/entities/AppConfig.js';

// Mock the config.json data
const mockConfigData = {
  availableYears: [2022, 2023, 2024, 2025],
  // other potential config properties
};
vi.mock('../../data/config.json', () => ({
  default: mockConfigData,
}));

const mockInvalidConfigNoYears = {};
const mockInvalidConfigYearsNotArray = { availableYears: "not-an-array" };
const mockInvalidConfigYearsNotNumbers = { availableYears: [2022, "2023", 2024] };


describe('JsonAppConfigRepository', () => {
  let repository;

  beforeEach(() => {
    // The mock for config.json is global for this test file.
    // If a test needs a different version of config.json, vi.doMock would be used
    // along with dynamic import or vi.resetModules.
    repository = new JsonAppConfigRepository(); // Uses the global mockConfigData
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Just in case any spies were added, though not in this version.
  });


  describe('getAppConfig', () => {
    it('should return an AppConfig instance with availableYears from config.json', async () => {
      const appConfig = await repository.getAppConfig();

      expect(appConfig).toBeInstanceOf(AppConfig);
      // AppConfig sorts years, so ensure comparison is with sorted data if mock isn't sorted.
      const sortedMockYears = [...mockConfigData.availableYears].sort((a, b) => a - b);
      expect(appConfig.availableYears).toEqual(sortedMockYears);
    });
  });

  describe('Constructor Validations', () => {
    it('should throw error if config.json data is missing availableYears', async () => {
      vi.doMock('../../data/config.json', () => ({ default: mockInvalidConfigNoYears }));
      // Need to re-import or use a dynamic import to get the module with the new mock
      await expect(async () => {
        const { JsonAppConfigRepository: BadRepo } = await import('./JsonAppConfigRepository.js?v=1');
        new BadRepo();
      }).rejects.toThrow("JsonAppConfigRepository: Invalid or missing config.json data. Expected { availableYears: [...] }");
      vi.doUnmock('../../data/config.json');
    });

    it('should throw error if availableYears is not an array', async () => {
      vi.doMock('../../data/config.json', () => ({ default: mockInvalidConfigYearsNotArray }));
      await expect(async () => {
        const { JsonAppConfigRepository: BadRepo } = await import('./JsonAppConfigRepository.js?v=2');
        new BadRepo();
      }).rejects.toThrow("JsonAppConfigRepository: Invalid or missing config.json data. Expected { availableYears: [...] }");
      vi.doUnmock('../../data/config.json');
    });

    it('should throw error if availableYears does not contain all numbers', async () => {
      vi.doMock('../../data/config.json', () => ({ default: mockInvalidConfigYearsNotNumbers }));
      await expect(async () => {
        const { JsonAppConfigRepository: BadRepo } = await import('./JsonAppConfigRepository.js?v=3');
        new BadRepo();
      }).rejects.toThrow("JsonAppConfigRepository: config.json availableYears must be an array of integer numbers.");
      vi.doUnmock('../../data/config.json');
    });
  });
});
