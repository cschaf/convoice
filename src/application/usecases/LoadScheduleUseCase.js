// src/application/usecases/LoadScheduleUseCase.js
import Event from '../../domain/entities/Event.js';
import YearlyRawData from '../../domain/entities/YearlyRawData.js'; // Needed for instantiation
// IYearlyDataRepository, IMemberRepository, ScheduleGeneratorService will be injected.

export class LoadScheduleUseCase {
    /**
     * @param {IYearlyDataRepository} yearlyDataRepository - An instance of a class implementing IYearlyDataRepository.
     * @param {IMemberRepository} memberRepository - An instance of a class implementing IMemberRepository.
     * @param {ScheduleGeneratorService} scheduleGeneratorService - An instance of ScheduleGeneratorService.
     */
    constructor(yearlyDataRepository, memberRepository, scheduleGeneratorService) {
        if (!yearlyDataRepository || typeof yearlyDataRepository.getYearlyData !== 'function') {
            throw new Error("LoadScheduleUseCase: yearlyDataRepository is invalid or missing getYearlyData method.");
        }
        if (!memberRepository || typeof memberRepository.getAllMembers !== 'function') {
            throw new Error("LoadScheduleUseCase: memberRepository is invalid or missing getAllMembers method.");
        }
        if (!scheduleGeneratorService || typeof scheduleGeneratorService.generateYearlySchedule !== 'function') {
            throw new Error("LoadScheduleUseCase: scheduleGeneratorService is invalid or missing generateYearlySchedule method.");
        }
        this.yearlyDataRepository = yearlyDataRepository;
        this.memberRepository = memberRepository;
        this.scheduleGeneratorService = scheduleGeneratorService;
    }

    /**
     * Executes the use case to load the full schedule for a given year.
     * @param {number} year - The year for which to load the schedule.
     * @returns {Promise<Event[]>} An array of Event entities.
     */
    async execute(year) {
        if (typeof year !== 'number' || !Number.isInteger(year)) {
            throw new Error("LoadScheduleUseCase: Year must be an integer number.");
        }

        const currentYearRawData = await this.yearlyDataRepository.getYearlyData(year);

        if (!currentYearRawData) {
            console.warn(`LoadScheduleUseCase: No data found for year ${year}. Returning empty schedule.`);
            return [];
        }

        const previousYearRawData = await this.yearlyDataRepository.getYearlyData(year - 1);

        let combinedExceptionalTimespans = [...(currentYearRawData.exceptionalTimespans || [])];

        if (previousYearRawData && previousYearRawData.exceptionalTimespans && Array.isArray(previousYearRawData.exceptionalTimespans)) {
          combinedExceptionalTimespans = [
            ...previousYearRawData.exceptionalTimespans,
            ...combinedExceptionalTimespans // Current year's timespans come after previous year's
          ];
        }

        // Create an effective YearlyRawData for the generator, using the combined timespans
        const effectiveYearlyData = new YearlyRawData(
          currentYearRawData.year, // Should be the target 'year'
          currentYearRawData.events,
          currentYearRawData.exceptionalDates,
          combinedExceptionalTimespans // Use the merged list
        );

        const members = await this.memberRepository.getAllMembers();

        return this.scheduleGeneratorService.generateYearlySchedule(effectiveYearlyData, members, year);
    }
}
