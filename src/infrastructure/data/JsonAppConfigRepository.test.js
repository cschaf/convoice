import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JsonAppConfigRepository } from './JsonAppConfigRepository.js';
import AppConfig from '../../domain/entities/AppConfig.js';

// Define mock data variants
const mockRehearsalSetting = {
  id: "test_rehearsal", title: "Test Rehearsal", dayOfWeek: 1, startTime: "10:00",
  endTime: "12:00", frequency: "weekly", defaultLocation: "Test Location", description: "A test rehearsal"
};

const mockConfigDataDefault = { // Renamed for clarity
  availableYears: [2022, 2023, 2024, 2025],
  rehearsalSettings: [mockRehearsalSetting],
};

const mockConfigDataNoRehearsalSettings = {
  availableYears: [2022, 2023, 2024, 2025],
  // rehearsalSettings is undefined here
};

const mockConfigDataEmptyRehearsalSettings = {
  availableYears: [2022, 2023],
  rehearsalSettings: []
};

const mockConfigDataUndefinedRehearsalSettings = {
  availableYears: [2022, 2023],
  rehearsalSettings: undefined
};

const mockInvalidConfigNoYears = {
  // availableYears is missing
};
const mockInvalidConfigYearsNotArray = { availableYears: "not-an-array" };
const mockInvalidConfigYearsNotNumbers = { availableYears: [2022, "2023", 2024] };
const mockInvalidConfigRehearsalSettingsNotArray = { availableYears: [2022], rehearsalSettings: "not-an-array" };

// Global mock for config.json, provides a default valid configuration
// This mock is applied before any tests run and re-applied by vi.resetModules()
vi.mock('../../data/config.json', () => {
  // Define the default mock structure directly inside the factory
  // to avoid hoisting issues with external const declarations.
  const defaultRehearsalSetting = {
    id: "test_rehearsal", title: "Test Rehearsal", dayOfWeek: 1, startTime: "10:00",
    endTime: "12:00", frequency: "weekly", defaultLocation: "Test Location", description: "A test rehearsal"
  };
  return {
    default: {
      availableYears: [2022, 2023, 2024, 2025],
      rehearsalSettings: [defaultRehearsalSetting],
    }
  };
});

describe('JsonAppConfigRepository', () => {
  beforeEach(() => {
    // Reset modules before each test. This ensures that each test gets a fresh import
    // of JsonAppConfigRepository, and the global vi.mock above is re-applied.
    // This is crucial for isolating tests when using vi.doMock for specific cases.
    vi.resetModules();
  });

  // Removed afterEach with vi.restoreAllMocks() as vi.resetModules() in beforeEach
  // should provide sufficient isolation for module-level mocks.

  describe('getAppConfig', () => {
    it('should return an AppConfig instance with availableYears from config.json', async () => {
      // Dynamically import to get the version affected by current mock state (default global mock)
      const { JsonAppConfigRepository: Repo } = await import('./JsonAppConfigRepository.js');
      // Dynamically import AppConfig as well to ensure it's the same module instance
      const { default: AppConfigLocal } = await import('../../domain/entities/AppConfig.js');
      const repository = new Repo();
      const appConfig = await repository.getAppConfig();

      expect(appConfig).toBeInstanceOf(AppConfigLocal);
      // Ensure years are sorted as AppConfig constructor sorts them.
      // Reference the years from the object that's actually used in the global mock factory.
      // The global mock factory defines its own availableYears.
      const expectedYears = [2022, 2023, 2024, 2025].sort((a,b) => a-b); // As defined in global vi.mock
      expect(appConfig.availableYears).toEqual(expectedYears);
    });
  });

  describe('Constructor Validations', () => {
    // Test cases for constructor validations. Each uses vi.doMock for a specific scenario.
    const constructorTestCases = [
      {
        name: 'should throw error if config.json data is missing availableYears',
        mockData: mockInvalidConfigNoYears,
        queryString: 'v=constructorNoYears',
        errorMessage: "JsonAppConfigRepository: Invalid or missing config.json data. Expected { availableYears: [...] }",
      },
      {
        name: 'should throw error if availableYears is not an array',
        mockData: mockInvalidConfigYearsNotArray,
        queryString: 'v=constructorYearsNotArray',
        errorMessage: "JsonAppConfigRepository: Invalid or missing config.json data. Expected { availableYears: [...] }",
      },
      {
        name: 'should throw error if availableYears does not contain all numbers',
        mockData: mockInvalidConfigYearsNotNumbers,
        queryString: 'v=constructorYearsNotNumbers',
        errorMessage: "JsonAppConfigRepository: config.json availableYears must be an array of integer numbers.",
      },
      {
        name: 'should throw error if rehearsalSettings is present and not an array',
        mockData: mockInvalidConfigRehearsalSettingsNotArray,
        queryString: 'v=constructorRehearsalNotArray',
        errorMessage: "JsonAppConfigRepository: config.json rehearsalSettings must be an array if present.",
      },
    ];

    for (const { name, mockData, queryString, errorMessage } of constructorTestCases) {
      it(name, async () => {
        // Apply a specific mock for this test case only
        vi.doMock('../../data/config.json', () => ({ default: mockData }));
        
        await expect(async () => {
          // Dynamically import the repository; it will use the mock defined by vi.doMock
          const { JsonAppConfigRepository: BadRepo } = await import('./JsonAppConfigRepository.js');
          new BadRepo(); // This instantiation should throw due to the invalid mockData
        }).rejects.toThrow(errorMessage);
      });
    }
  });

  describe('getRehearsalSettings', () => {
    it('should return rehearsalSettings from config.json if present (using explicitly defined default mock)', async () => {
      // Explicitly mock the default scenario for this test, mirroring the global mock's structure.
      vi.doMock('../../data/config.json', () => {
        const defaultRehearsalSettingInner = {
          id: "test_rehearsal", title: "Test Rehearsal", dayOfWeek: 1, startTime: "10:00",
          endTime: "12:00", frequency: "weekly", defaultLocation: "Test Location", description: "A test rehearsal"
        };
        return {
          default: {
            availableYears: [2022, 2023, 2024, 2025],
            rehearsalSettings: [defaultRehearsalSettingInner],
          }
        };
      });

      const { JsonAppConfigRepository: Repo } = await import('./JsonAppConfigRepository.js');
      const repository = new Repo(); 
      const settings = await repository.getRehearsalSettings();
      // Expectation should match the structure defined in the vi.doMock factory directly.
      expect(settings).toEqual([{
        id: "test_rehearsal", title: "Test Rehearsal", dayOfWeek: 1, startTime: "10:00",
        endTime: "12:00", frequency: "weekly", defaultLocation: "Test Location", description: "A test rehearsal"
      }]);
    });

    it('should return an empty array if rehearsalSettings is not defined in config.json', async () => {
      // Specific mock for this test: config.json has no rehearsalSettings property
      vi.doMock('../../data/config.json', () => ({ default: mockConfigDataNoRehearsalSettings }));
      
      const { JsonAppConfigRepository: Repo } = await import('./JsonAppConfigRepository.js');
      const repository = new Repo();
      const settings = await repository.getRehearsalSettings();
      expect(settings).toEqual([]);
    });

    it('should return an empty array if rehearsalSettings is explicitly undefined in config.json', async () => {
      // Specific mock: rehearsalSettings is explicitly set to undefined
      vi.doMock('../../data/config.json', () => ({ default: mockConfigDataUndefinedRehearsalSettings }));
      
      const { JsonAppConfigRepository: Repo } = await import('./JsonAppConfigRepository.js');
      const repository = new Repo();
      const settings = await repository.getRehearsalSettings();
      expect(settings).toEqual([]);
    });

    it('should return an empty array if rehearsalSettings is an empty array in config.json', async () => {
      // Specific mock: rehearsalSettings is an empty array
      vi.doMock('../../data/config.json', () => ({ default: mockConfigDataEmptyRehearsalSettings }));
      
      const { JsonAppConfigRepository: Repo } = await import('./JsonAppConfigRepository.js');
      const repository = new Repo();
      const settings = await repository.getRehearsalSettings();
      expect(settings).toEqual([]);
    });
  });
});
