import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageYearlyDataUseCase } from './ManageYearlyDataUseCase.js';
import YearlyRawData from '../../domain/entities/YearlyRawData.js';

// Mock IYearlyDataRepository
const mockYearlyDataRepository = {
  getYearlyData: vi.fn(),
  saveYearlyData: vi.fn(),
  // getAvailableYears is not used by this use case, so no need to mock it here
};

describe('ManageYearlyDataUseCase', () => {
  let manageYearlyDataUseCase;
  const testYear = 2024;

  beforeEach(() => {
    vi.resetAllMocks();
    manageYearlyDataUseCase = new ManageYearlyDataUseCase(mockYearlyDataRepository);
  });

  describe('loadRawDataForYear', () => {
    it('should return YearlyRawData instance when repository finds data', async () => {
      const mockData = new YearlyRawData(testYear, [], [], []);
      mockYearlyDataRepository.getYearlyData.mockResolvedValue(mockData);

      const result = await manageYearlyDataUseCase.loadRawDataForYear(testYear);

      expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear);
      expect(result).toBeInstanceOf(YearlyRawData);
      expect(result).toEqual(mockData);
    });

    it('should return null when repository returns null (data not found)', async () => {
      mockYearlyDataRepository.getYearlyData.mockResolvedValue(null);

      const result = await manageYearlyDataUseCase.loadRawDataForYear(testYear);

      expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear);
      expect(result).toBeNull();
    });

    it('should return null when repository throws an error', async () => {
      mockYearlyDataRepository.getYearlyData.mockRejectedValue(new Error("DB error"));

      const result = await manageYearlyDataUseCase.loadRawDataForYear(testYear);

      expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear);
      expect(result).toBeNull(); // As per current implementation, it catches and returns null
    });

     it('should return null if year is not a number', async () => {
      const result = await manageYearlyDataUseCase.loadRawDataForYear("not-a-year");
      expect(mockYearlyDataRepository.getYearlyData).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('saveRawDataForYear', () => {
    it('should call repository saveYearlyData with a YearlyRawData instance', async () => {
      const rawDataParams = {
        events: [{ title: 'Event 1', date: `${testYear}-01-01`, startTime: '10:00', endTime: '11:00' }],
        exceptionalDates: [`${testYear}-01-05`],
        exceptionalTimespans: [{ start: `${testYear}-02-01`, end: `${testYear}-02-05` }],
      };
      mockYearlyDataRepository.saveYearlyData.mockResolvedValue(undefined);

      await manageYearlyDataUseCase.saveRawDataForYear(testYear, rawDataParams);

      expect(mockYearlyDataRepository.saveYearlyData).toHaveBeenCalledWith(
        testYear,
        expect.any(YearlyRawData) // Check if it's an instance of YearlyRawData
      );
      // More specific check on the content of the YearlyRawData instance
      const yearlyRawDataArg = mockYearlyDataRepository.saveYearlyData.mock.calls[0][1];
      expect(yearlyRawDataArg.year).toBe(testYear);
      expect(yearlyRawDataArg.events).toEqual(rawDataParams.events);
      expect(yearlyRawDataArg.exceptionalDates).toEqual(rawDataParams.exceptionalDates);
      expect(yearlyRawDataArg.exceptionalTimespans).toEqual(rawDataParams.exceptionalTimespans);
    });

    it('should throw TypeError if year is not a number', async () => {
        const rawDataParams = {};
        await expect(manageYearlyDataUseCase.saveRawDataForYear("not-a-year", rawDataParams))
            .rejects.toThrow(TypeError);
    });

    it('should throw TypeError if rawDataParams is null or not an object', async () => {
        await expect(manageYearlyDataUseCase.saveRawDataForYear(testYear, null))
            .rejects.toThrow(TypeError);
        await expect(manageYearlyDataUseCase.saveRawDataForYear(testYear, "not-an-object"))
            .rejects.toThrow(TypeError);
    });
  });

  describe('validateYearlyData', () => {
    const validEvent = { title: 'Valid Event', date: `${testYear}-03-10`, startTime: '10:00', endTime: '11:00' };
    const validExDate = `${testYear}-03-15`;
    const validExTimespan = { start: `${testYear}-03-20`, end: `${testYear}-03-25` };

    it('should return isValid true for valid data', async () => {
      const data = {
        events: [validEvent],
        exceptionalDates: [validExDate],
        exceptionalTimespans: [validExTimespan],
      };
      const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.warnings.length).toBe(0);
    });

    it('should return isValid false for invalid top-level structure', async () => {
      const data = { events: "not-an-array" };
      const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid data structure: Must be an object with events, exceptionalDates, and exceptionalTimespans arrays.');
    });

    it('should return errors for invalid event data', async () => {
      const data = {
        events: [{ title: '', date: 'bad-date', startTime: '10:00', endTime: '11:00' }],
        exceptionalDates: [], exceptionalTimespans: [],
      };
      const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Validation Error in Event \"Event 1\": Field 'title' is required.");
      expect(result.errors).toContain("Validation Error in Event \"Event 1\": Field 'date' is required in YYYY-MM-DD format.");
    });

    it('should return warnings for event year mismatch', async () => {
      const data = {
        events: [{ ...validEvent, date: `${testYear + 1}-03-10` }],
        exceptionalDates: [], exceptionalTimespans: [],
      };
      const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
      expect(result.isValid).toBe(true); // Only warnings, so still valid
      expect(result.warnings).toContain(`Event "${validEvent.title}" date year (${testYear + 1}) does not match main year (${testYear}).`);
    });

    it('should return errors for invalid exceptionalDate format', async () => {
        const data = { events: [], exceptionalDates: ["bad-date"], exceptionalTimespans: [] };
        const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Validation Error in Exceptional Date 1: Must be a string in YYYY-MM-DD format.");
    });

    it('should return warnings for exceptionalDate year mismatch', async () => {
        const data = { events: [], exceptionalDates: [`${testYear + 1}-03-15`], exceptionalTimespans: [] };
        const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(`Exceptional Date "${testYear + 1}-03-15" year (${testYear + 1}) does not match main year (${testYear}).`);
    });

    it('should return errors for invalid exceptionalTimespan format', async () => {
        const data = { events: [], exceptionalDates: [], exceptionalTimespans: [{start: "bad-start", end: validExTimespan.end}] };
        const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(`Validation Error in Timespan "bad-start - ${validExTimespan.end}\": Field 'start' is required in YYYY-MM-DD format.`);
    });

    it('should return warnings for exceptionalTimespan year mismatch', async () => {
        const data = { events: [], exceptionalDates: [], exceptionalTimespans: [{start: `${testYear + 1}-03-20`, end: `${testYear + 1}-03-25`}] };
        const result = await manageYearlyDataUseCase.validateYearlyData(data, testYear);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(`Timespan "${testYear + 1}-03-20 - ${testYear + 1}-03-25\" start date year (${testYear + 1}) does not match main year (${testYear}).`);
        expect(result.warnings).toContain(`Timespan "${testYear + 1}-03-20 - ${testYear + 1}-03-25\" end date year (${testYear + 1}) does not match main year (${testYear}).`);
    });

    it('should return an error if yearToValidateAgainst is not a number', async () => {
        const data = { events: [], exceptionalDates: [], exceptionalTimespans: [] };
        const result = await manageYearlyDataUseCase.validateYearlyData(data, "not-a-year");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Validation target year must be a valid number.");
    });

  });
});
