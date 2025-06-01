import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAppConfigUseCase } from './GetAppConfigUseCase.js';
import AppConfig from '../../domain/entities/AppConfig.js';

// Mock IAppConfigRepository
const mockAppConfigRepository = {
  getAppConfig: vi.fn(),
};

describe('GetAppConfigUseCase', () => {
  let getAppConfigUseCase;

  beforeEach(() => {
    vi.resetAllMocks();
    getAppConfigUseCase = new GetAppConfigUseCase(mockAppConfigRepository);
  });

  it('should call repository and return AppConfig instance', async () => {
    const mockAppConfigData = new AppConfig([2023, 2024]);
    mockAppConfigRepository.getAppConfig.mockResolvedValue(mockAppConfigData);

    const result = await getAppConfigUseCase.execute();

    expect(mockAppConfigRepository.getAppConfig).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(AppConfig);
    expect(result).toEqual(mockAppConfigData);
    expect(result.availableYears).toEqual([2023, 2024]);
  });

  it('should throw an error if repository throws an error', async () => {
    const errorMessage = "Failed to fetch config";
    mockAppConfigRepository.getAppConfig.mockRejectedValue(new Error(errorMessage));

    await expect(getAppConfigUseCase.execute()).rejects.toThrow(errorMessage);
    expect(mockAppConfigRepository.getAppConfig).toHaveBeenCalledTimes(1);
  });

  it('should throw an error during construction if repository is invalid', () => {
    expect(() => new GetAppConfigUseCase(null)).toThrow("GetAppConfigUseCase: appConfigRepository is invalid or missing getAppConfig method.");
    expect(() => new GetAppConfigUseCase({})).toThrow("GetAppConfigUseCase: appConfigRepository is invalid or missing getAppConfig method.");
  });
});
