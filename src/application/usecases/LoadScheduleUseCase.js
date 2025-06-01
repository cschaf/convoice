// src/application/usecases/LoadScheduleUseCase.js
import Event from '../../domain/entities/Event.js';
// IYearlyDataRepository, IMemberRepository, ScheduleGeneratorService will be injected.
// ScheduleGeneratorService is expected to be found at '../../domain/services/ScheduleGeneratorService.js'

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

        const yearlyRawData = await this.yearlyDataRepository.getYearlyData(year);

        if (!yearlyRawData) {
            // Or handle this more gracefully, maybe return empty array or throw specific error
            console.warn(`LoadScheduleUseCase: No data found for year ${year}. Returning empty schedule.`);
            return [];
        }

        const members = await this.memberRepository.getAllMembers();

        // Assuming generateYearlySchedule expects the targetYear explicitly
        // and YearlyRawData might not internally hold the year or it might be for cross-year checks.
        return this.scheduleGeneratorService.generateYearlySchedule(yearlyRawData, members, year);
    }
}
