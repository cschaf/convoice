// src/application/usecases/LoadAvailableYearsUseCase.js
// IYearlyDataRepository will be injected.

export class LoadAvailableYearsUseCase {
    /**
     * @param {IYearlyDataRepository} yearlyDataRepository - An instance of a class implementing IYearlyDataRepository.
     */
    constructor(yearlyDataRepository) {
        if (!yearlyDataRepository || typeof yearlyDataRepository.getAvailableYears !== 'function') {
            throw new Error("LoadAvailableYearsUseCase: yearlyDataRepository is invalid or missing getAvailableYears method.");
        }
        this.yearlyDataRepository = yearlyDataRepository;
    }

    /**
     * Executes the use case to get the list of available years.
     * @returns {Promise<number[]>} An array of years.
     */
    async execute() {
        // This assumes IYearlyDataRepository has getAvailableYears.
        // Alternatively, this could fetch AppConfig and get years from there,
        // depending on where the source of truth for "available years for data loading" resides.
        return this.yearlyDataRepository.getAvailableYears();
    }
}
