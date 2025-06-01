import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoadAvailableYearsUseCase } from './LoadAvailableYearsUseCase.js';

// Mock IYearlyDataRepository
const mockYearlyDataRepository = {
  getAvailableYears: vi.fn(),
  // getYearlyData and saveYearlyData are not used by this use case
};

describe('LoadAvailableYearsUseCase', () => {
  let loadAvailableYearsUseCase;

  beforeEach(() => {
    vi.resetAllMocks();
    loadAvailableYearsUseCase = new LoadAvailableYearsUseCase(mockYearlyDataRepository);
  });

  it('should call repository and return an array of years', async () => {
    const mockYears = [2023, 2024, 2025];
    mockYearlyDataRepository.getAvailableYears.mockResolvedValue(mockYears);

    const result = await loadAvailableYearsUseCase.execute();

    expect(mockYearlyDataRepository.getAvailableYears).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(Array);
    expect(result).toEqual(mockYears);
  });

  it('should return an empty array if repository returns an empty array', async () => {
    mockYearlyDataRepository.getAvailableYears.mockResolvedValue([]);

    const result = await loadAvailableYearsUseCase.execute();

    expect(mockYearlyDataRepository.getAvailableYears).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('should throw an error if repository throws an error', async () => {
    const errorMessage = "Failed to fetch available years";
    mockYearlyDataRepository.getAvailableYears.mockRejectedValue(new Error(errorMessage));

    await expect(loadAvailableYearsUseCase.execute()).rejects.toThrow(errorMessage);
    expect(mockYearlyDataRepository.getAvailableYears).toHaveBeenCalledTimes(1);
  });

  it('should throw an error during construction if repository is invalid', () => {
    expect(() => new LoadAvailableYearsUseCase(null)).toThrow("LoadAvailableYearsUseCase: yearlyDataRepository is invalid or missing getAvailableYears method.");
    expect(() => new LoadAvailableYearsUseCase({})).toThrow("LoadAvailableYearsUseCase: yearlyDataRepository is invalid or missing getAvailableYears method.");
  });
});
