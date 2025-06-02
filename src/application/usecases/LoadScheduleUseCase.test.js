import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoadScheduleUseCase } from './LoadScheduleUseCase.js';
import Event from '../../domain/entities/Event.js';
import YearlyRawData from '../../domain/entities/YearlyRawData.js';
import Member from '../../domain/entities/Member.js';
import ScheduleGeneratorService from '../../domain/services/ScheduleGeneratorService.js';

// Mocks
const mockYearlyDataRepository = {
  getYearlyData: vi.fn(),
};
const mockMemberRepository = {
  getAllMembers: vi.fn(),
};
const scheduleGeneratorService = new ScheduleGeneratorService();
vi.spyOn(scheduleGeneratorService, 'generateYearlySchedule');

const mockAppConfigRepository = {
  getRehearsalSettings: vi.fn(),
};

const sampleRehearsalConfigs = [
  { id: 'rehearsal1', title: 'Choir Rehearsal', dayOfWeek: 2, startTime: '19:00', endTime: '20:30', frequency: 'weekly', defaultLocation: 'Community Hall' }
];

describe('LoadScheduleUseCase', () => {
  let loadScheduleUseCase;
  const testYear = 2024;

  beforeEach(() => {
    vi.resetAllMocks(); // Resets all mocks including spies
    // Re-apply spy if resetAllMocks clears it in a way that removes it from the instance
    // However, typically spies on object methods are restored unless the object itself is changed.
    // If issues occur, re-spy here: vi.spyOn(scheduleGeneratorService, 'generateYearlySchedule');

    // Reset mocks before each test
    vi.resetAllMocks(); 
    // Re-spy on generateYearlySchedule as resetAllMocks clears spies too
    vi.spyOn(scheduleGeneratorService, 'generateYearlySchedule'); 
    // Mock default return values for repositories
    mockAppConfigRepository.getRehearsalSettings.mockResolvedValue(sampleRehearsalConfigs);


    loadScheduleUseCase = new LoadScheduleUseCase(
      mockYearlyDataRepository,
      mockMemberRepository,
      scheduleGeneratorService,
      mockAppConfigRepository
    );
  });

  it('should successfully load schedule, merging previous year timespans and passing rehearsal configs', async () => {
    const currentYearTimespan = { start: `${testYear}-01-01`, end: `${testYear}-01-02`, description: "Current Year Span" };
    const prevYearTimespan = { start: `${testYear - 1}-12-30`, end: `${testYear - 1}-12-31`, description: "Previous Year Span" };

    const mockCurrentYearRawData = new YearlyRawData(testYear, [{id: 'evt1', title: 'Test Event', date: `${testYear}-01-01`, startTime: '10:00', endTime: '11:00', type: 'event'}], [], [currentYearTimespan]);
    const mockPreviousYearRawData = new YearlyRawData(testYear - 1, [], [], [prevYearTimespan]);
    const mockMembers = [new Member('John Doe', `${testYear}-01-10`, 'm1')];

    mockYearlyDataRepository.getYearlyData
      .mockImplementation(async (year) => {
        if (year === testYear) return mockCurrentYearRawData;
        if (year === testYear - 1) return mockPreviousYearRawData;
        return null;
      });
    mockMemberRepository.getAllMembers.mockResolvedValue(mockMembers);

    const result = await loadScheduleUseCase.execute(testYear);

    expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear);
    expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear - 1);
    expect(mockMemberRepository.getAllMembers).toHaveBeenCalled();
    expect(mockAppConfigRepository.getRehearsalSettings).toHaveBeenCalled();

    const expectedCombinedTimespans = [prevYearTimespan, currentYearTimespan];
    const expectedEffectiveYearlyData = new YearlyRawData(
        testYear,
        mockCurrentYearRawData.events,
        mockCurrentYearRawData.exceptionalDates,
        expectedCombinedTimespans
    );

    expect(scheduleGeneratorService.generateYearlySchedule).toHaveBeenCalledWith(
      expect.objectContaining({ // Use objectContaining to match structure and specific properties
        year: testYear,
        events: mockCurrentYearRawData.events,
        exceptionalDates: mockCurrentYearRawData.exceptionalDates,
        exceptionalTimespans: expectedCombinedTimespans,
      }),
      mockMembers,
      testYear,
      sampleRehearsalConfigs // Added rehearsalConfigs
    );

    expect(result).toBeInstanceOf(Array);
    result.forEach(event => expect(event).toBeInstanceOf(Event));
    const testEvent = result.find(e => e.id === 'evt1');
    expect(testEvent).toBeDefined();
    if(testEvent) expect(testEvent.title).toBe('Test Event');
  });

  it('should handle current year data not found', async () => {
    mockYearlyDataRepository.getYearlyData.mockResolvedValue(null); // Current year not found

    const result = await loadScheduleUseCase.execute(testYear);

    expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear);
    // Important: If current year data is not found, it should not attempt to fetch previous year or members.
    expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledTimes(1);
    expect(mockMemberRepository.getAllMembers).not.toHaveBeenCalled();
    expect(scheduleGeneratorService.generateYearlySchedule).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should handle previous year data not found gracefully (uses only current year timespans)', async () => {
    const currentYearTimespan = { start: `${testYear}-01-01`, end: `${testYear}-01-02` };
    const mockCurrentYearRawData = new YearlyRawData(testYear, [], [], [currentYearTimespan]);
    const mockMembers = [new Member('John Doe', `${testYear}-01-10`, 'm1')];

    mockYearlyDataRepository.getYearlyData
      .mockImplementation(async (year) => {
        if (year === testYear) return mockCurrentYearRawData;
        if (year === testYear - 1) return null; // Previous year not found
        return null;
      });
    mockMemberRepository.getAllMembers.mockResolvedValue(mockMembers);

    await loadScheduleUseCase.execute(testYear);

    expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear);
    expect(mockYearlyDataRepository.getYearlyData).toHaveBeenCalledWith(testYear - 1);
    expect(mockMemberRepository.getAllMembers).toHaveBeenCalled();
    expect(mockAppConfigRepository.getRehearsalSettings).toHaveBeenCalled(); // Also called here

    // Expect service to be called with only current year's timespans
    expect(scheduleGeneratorService.generateYearlySchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        exceptionalTimespans: [currentYearTimespan],
      }),
      mockMembers,
      testYear,
      sampleRehearsalConfigs // Added rehearsalConfigs
    );
  });

  it('should handle empty member list', async () => {
    const mockCurrentYearRawData = new YearlyRawData(testYear, [], [], []);
    mockYearlyDataRepository.getYearlyData
        .mockImplementation(async (year) => {
            if (year === testYear) return mockCurrentYearRawData;
            if (year === testYear - 1) return null; // Assume previous year not found for simplicity here
            return null;
        });
    mockMemberRepository.getAllMembers.mockResolvedValue([]); // Empty members list

    await loadScheduleUseCase.execute(testYear);

    expect(scheduleGeneratorService.generateYearlySchedule).toHaveBeenCalledWith(
      expect.anything(), // We care more about the members array in this test
      [], // Expect empty array for members
      testYear,
      sampleRehearsalConfigs // Added rehearsalConfigs
    );
  });

  it('should throw an error if year is not a number', async () => {
    await expect(loadScheduleUseCase.execute("not-a-year")).rejects.toThrow("LoadScheduleUseCase: Year must be an integer number.");
  });

  // The specific test for "Handling of previous year exceptional timespans (ASSUMES LoadScheduleUseCase IS ENHANCED)"
  // can be removed or merged into the main success case, as the use case is now enhanced.
  // The main success case now covers the merge.
});
