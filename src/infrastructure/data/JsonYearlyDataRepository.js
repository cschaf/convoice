// src/infrastructure/data/JsonYearlyDataRepository.js
import { IYearlyDataRepository } from '../../application/repositories/IYearlyDataRepository.js';
import YearlyRawData from '../../domain/entities/YearlyRawData.js';
// AppConfig entity is not directly used here, but configData for availableYears is.
import configData from '../../data/config.json' assert { type: "json" }; // For availableYears from config

export class JsonYearlyDataRepository extends IYearlyDataRepository {
    constructor() {
        super();
        if (!configData || !Array.isArray(configData.availableYears)) {
            console.warn("JsonYearlyDataRepository: config.json might be missing or invalid. getAvailableYears might not work as expected and data loading might be unguided.");
        }
    }

    /**
     * Dynamically loads yearly data from a JSON file.
     * @param {number} year The year for which to load data.
     * @returns {Promise<YearlyRawData|null>} Resolves to YearlyRawData or null if not found/error.
     */
    async getYearlyData(year) {
        if (typeof year !== 'number' || !Number.isInteger(year)) {
            console.error("JsonYearlyDataRepository.getYearlyData: Year must be an integer number.");
            return null; // Or throw new TypeError("Year must be an integer number.");
        }
        try {
            // Vite/Webpack specific dynamic import. Path must be relative.
            // For a standard ES module dynamic import, the path might need to be resolvable
            // differently, e.g. via an import map or full URL if running in browser directly.
            // Assuming a bundler handles this path correctly.
            const assetURL = new URL(`../../data/${year}.json`, import.meta.url).href;
            const yearlyDataModule = await import(assetURL, { assert: { type: "json" } });
            const data = yearlyDataModule.default !== undefined ? yearlyDataModule.default : yearlyDataModule;

            // Validate the structure of the loaded data.
            if (typeof data === 'object' && data !== null &&
                data.hasOwnProperty('events') && Array.isArray(data.events) &&
                data.hasOwnProperty('exceptionalDates') && Array.isArray(data.exceptionalDates) &&
                data.hasOwnProperty('exceptionalTimespans') && Array.isArray(data.exceptionalTimespans)) {
                // The YearlyRawData constructor will perform its own validation on parameters.
                return new YearlyRawData(year, data.events, data.exceptionalDates, data.exceptionalTimespans);
            } else {
                console.warn(`JsonYearlyDataRepository: Data file ${year}.json has unexpected structure. Content:`, data);
                return null; // Or throw a more specific error for malformed data
            }
        } catch (error) {
            // This catch block handles errors from the dynamic import (e.g., file not found)
            // and also potential errors from the YearlyRawData constructor if data is invalid.
            console.warn(`JsonYearlyDataRepository: Could not load or parse data for year ${year}: ${error.message}. Assuming file does not exist or is invalid.`);
            return null; // File not found or other import/parse error
        }
    }

    /**
     * Simulates saving data. In a browser context with local JSON, this means
     * the user is typically prompted to download the file and manually replace it.
     * @param {number} year - The year for which to save data.
     * @param {YearlyRawData} data - The YearlyRawData instance to save.
     * @returns {Promise<void>}
     */
    async saveYearlyData(year, data) {
        if (typeof year !== 'number' || !Number.isInteger(year)) {
            return Promise.reject(new Error("JsonYearlyDataRepository.saveYearlyData: Year must be an integer number."));
        }
        if (!(data instanceof YearlyRawData)) {
            // Or if you allow plain objects, validate its structure.
            return Promise.reject(new Error("JsonYearlyDataRepository.saveYearlyData: Data must be an instance of YearlyRawData."));
        }

        console.log(`JsonYearlyDataRepository: Simulating save for year ${year}...`);
        // Data is stringified. If YearlyRawData has a toJSON, it would be used.
        // Otherwise, all public fields are stringified.
        console.log('Data to be "saved" (user should download and replace manually):', JSON.stringify(data, null, 2));

        // In a real application, this would be an API call or filesystem access (in Node.js).
        // For this project, the actual download is triggered by the UI based on data prepared by a use case.
        // This repository method acknowledges the "save" attempt at the infrastructure level.
        return Promise.resolve();
    }

    /**
     * Retrieves a list of available years from config.json.
     * @returns {Promise<number[]>} An array of available years.
     */
    async getAvailableYears() {
        if (configData && Array.isArray(configData.availableYears) &&
            configData.availableYears.every(year => typeof year === 'number' && Number.isInteger(year))) {
            return [...configData.availableYears].sort((a,b) => a - b); // Return a sorted copy
        }
        console.warn("JsonYearlyDataRepository: Could not retrieve available years from config.json or data is invalid. Returning empty array.");
        return [];
    }
}
