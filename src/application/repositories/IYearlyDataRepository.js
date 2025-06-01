// src/application/repositories/IYearlyDataRepository.js
import YearlyRawData from '../../domain/entities/YearlyRawData.js';

/**
 * Interface for accessing and modifying yearly schedule data.
 */
export class IYearlyDataRepository {
    /**
     * Retrieves the raw data for a specific year.
     * @param {number} year - The year for which to retrieve data.
     * @returns {Promise<YearlyRawData>} A promise that resolves to a YearlyRawData instance.
     *                                    Should resolve to null or throw a specific error if data for the year is not found.
     */
    async getYearlyData(year) {
        throw new Error('Method not implemented: getYearlyData');
    }

    /**
     * Saves the raw data for a specific year.
     * This would typically involve writing to a file (e.g., {year}.json) or an API endpoint.
     * @param {number} year - The year for which to save data.
     * @param {YearlyRawData} data - The YearlyRawData instance to save.
     * @returns {Promise<void>} A promise that resolves when the data is successfully saved.
     */
    async saveYearlyData(year, data) {
        throw new Error('Method not implemented: saveYearlyData');
    }

    /**
     * Retrieves a list of years for which data is available.
     * This could be derived from available {year}.json files or from a configuration.
     * @returns {Promise<number[]>} A promise that resolves to an array of available years (numbers).
     */
    async getAvailableYears() {
        throw new Error('Method not implemented: getAvailableYears');
    }
}
