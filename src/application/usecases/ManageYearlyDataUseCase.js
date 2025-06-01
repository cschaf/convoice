// src/application/usecases/ManageYearlyDataUseCase.js
import YearlyRawData from '../../domain/entities/YearlyRawData.js';
// IYearlyDataRepository will be injected.
// Consider if a validation service/ruleset from domain layer is needed for more complex validation.

export class ManageYearlyDataUseCase {
    /**
     * @param {IYearlyDataRepository} yearlyDataRepository
     */
    constructor(yearlyDataRepository) {
        if (!yearlyDataRepository ||
            typeof yearlyDataRepository.getYearlyData !== 'function' ||
            typeof yearlyDataRepository.saveYearlyData !== 'function') {
            throw new Error("ManageYearlyDataUseCase: yearlyDataRepository is invalid or missing required methods (getYearlyData, saveYearlyData).");
        }
        this.yearlyDataRepository = yearlyDataRepository;
    }

    /**
     * Loads raw data for a specific year for editing or review.
     * @param {number} year - The year for which to load data.
     * @returns {Promise<YearlyRawData|null>} YearlyRawData instance or null if not found.
     */
    async loadRawDataForYear(year) {
        if (typeof year !== 'number' || !Number.isInteger(year)) {
            console.error("ManageYearlyDataUseCase.loadRawDataForYear: Year must be an integer number.");
            // Or throw new TypeError("Year must be an integer number.");
            return null;
        }
        try {
            return await this.yearlyDataRepository.getYearlyData(year);
        } catch (error) {
            // Log error or handle specific error types if repository throws them
            console.error(`ManageYearlyDataUseCase: Error loading raw data for year ${year}:`, error);
            return null; // Or re-throw a use-case specific error
        }
    }

    /**
     * Saves raw data for a specific year.
     * @param {number} year - The year for which to save data.
     * @param {object} rawDataParams - Plain object containing events, exceptionalDates, exceptionalTimespans.
     *                                 This will be used to construct a YearlyRawData instance.
     * @returns {Promise<void>}
     */
    async saveRawDataForYear(year, rawDataParams) {
        if (typeof year !== 'number' || !Number.isInteger(year)) {
            throw new TypeError("ManageYearlyDataUseCase.saveRawDataForYear: Year must be an integer number.");
        }
        if (typeof rawDataParams !== 'object' || rawDataParams === null) {
            throw new TypeError("ManageYearlyDataUseCase.saveRawDataForYear: rawDataParams must be an object.");
        }
        // It's good practice for the use case to work with domain entities if possible,
        // or at least ensure the data conforms to the expected structure.
        const yearlyRawData = new YearlyRawData(
            year,
            rawDataParams.events || [],
            rawDataParams.exceptionalDates || [],
            rawDataParams.exceptionalTimespans || []
        );
        return this.yearlyDataRepository.saveYearlyData(year, yearlyRawData);
    }

    /**
     * Validates the yearly data structure and content.
     * This is a simplified version of the validation logic from DataEntryPage.jsx.
     * More complex validation could be delegated to a domain service.
     * @param {object} dataToValidate - Plain object containing events, exceptionalDates, exceptionalTimespans.
     * @param {number} yearToValidateAgainst - The primary year this data is supposed to be for.
     * @returns {Promise<{isValid: boolean, warnings: string[], errors: string[]}>}
     */
    async validateYearlyData(dataToValidate, yearToValidateAgainst) {
        const warnings = [];
        const errors = [];

        if (typeof yearToValidateAgainst !== 'number' || !Number.isInteger(yearToValidateAgainst)) {
            errors.push("Validation target year must be a valid number.");
            // Early exit if the reference year itself is invalid.
            return { isValid: false, warnings, errors };
        }
        const mainYearStr = String(yearToValidateAgainst);

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const timePattern = /^\d{2}:\d{2}$/;

        // Basic structure validation
        if (typeof dataToValidate !== 'object' || dataToValidate === null ||
            !Array.isArray(dataToValidate.events) ||
            !Array.isArray(dataToValidate.exceptionalDates) ||
            !Array.isArray(dataToValidate.exceptionalTimespans)) {
            errors.push('Invalid data structure: Must be an object with events, exceptionalDates, and exceptionalTimespans arrays.');
            return { isValid: false, warnings, errors }; // Early exit if structure is wrong
        }

        // Validate Events
        for (let i = 0; i < dataToValidate.events.length; i++) {
            const event = dataToValidate.events[i];
            if (typeof event !== 'object' || event === null) {
                errors.push(`Validation Error in Event ${i + 1}: Event must be an object.`);
                continue; // Skip to next event if this one is not an object
            }
            const eventTitle = event.title || `Event ${i + 1}`;

            if (!event.title || typeof event.title !== 'string' || event.title.trim() === '') {
                errors.push(`Validation Error in Event "${eventTitle}": Field 'title' is required.`);
            }
            if (!event.date || typeof event.date !== 'string' || !datePattern.test(event.date)) {
                errors.push(`Validation Error in Event "${eventTitle}": Field 'date' is required in YYYY-MM-DD format.`);
            } else {
                if (event.date.substring(0, 4) !== mainYearStr) {
                    warnings.push(`Event "${event.title}" date year (${event.date.substring(0, 4)}) does not match main year (${mainYearStr}).`);
                }
            }
            if (!event.startTime || typeof event.startTime !== 'string' || !timePattern.test(event.startTime)) {
                errors.push(`Validation Error in Event "${eventTitle}": Field 'startTime' is required in HH:MM format.`);
            }
            if (!event.endTime || typeof event.endTime !== 'string' || !timePattern.test(event.endTime)) {
                errors.push(`Validation Error in Event "${eventTitle}": Field 'endTime' is required in HH:MM format.`);
            }
        }

        // Validate Exceptional Dates
        for (let i = 0; i < dataToValidate.exceptionalDates.length; i++) {
            const exDate = dataToValidate.exceptionalDates[i];
            if (typeof exDate !== 'string' || !datePattern.test(exDate)) {
                errors.push(`Validation Error in Exceptional Date ${i + 1}: Must be a string in YYYY-MM-DD format.`);
            } else {
                if (exDate.substring(0, 4) !== mainYearStr) {
                    warnings.push(`Exceptional Date "${exDate}" year (${exDate.substring(0, 4)}) does not match main year (${mainYearStr}).`);
                }
            }
        }

        // Validate Exceptional Timespans
        for (let i = 0; i < dataToValidate.exceptionalTimespans.length; i++) {
            const ts = dataToValidate.exceptionalTimespans[i];
             if (typeof ts !== 'object' || ts === null) {
                errors.push(`Validation Error in Timespan ${i + 1}: Timespan must be an object.`);
                continue; // Skip to next timespan
            }
            const tsIdentifier = (ts.start && ts.end) ? `${ts.start} - ${ts.end}` : `Timespan ${i + 1}`;

            if (!ts.start || typeof ts.start !== 'string' || !datePattern.test(ts.start)) {
                errors.push(`Validation Error in Timespan "${tsIdentifier}": Field 'start' is required in YYYY-MM-DD format.`);
            } else {
                 if (ts.start.substring(0, 4) !== mainYearStr) {
                    warnings.push(`Timespan "${tsIdentifier}" start date year (${ts.start.substring(0, 4)}) does not match main year (${mainYearStr}).`);
                }
            }
            if (!ts.end || typeof ts.end !== 'string' || !datePattern.test(ts.end)) {
                errors.push(`Validation Error in Timespan "${tsIdentifier}": Field 'end' is required in YYYY-MM-DD format.`);
            } else {
                if (ts.end.substring(0, 4) !== mainYearStr) {
                    warnings.push(`Timespan "${tsIdentifier}" end date year (${ts.end.substring(0, 4)}) does not match main year (${mainYearStr}).`);
                }
            }
        }

        return { isValid: errors.length === 0, warnings, errors };
    }
}
