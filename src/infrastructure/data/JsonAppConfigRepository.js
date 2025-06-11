// src/infrastructure/data/JsonAppConfigRepository.js
import { IAppConfigRepository } from '../../application/repositories/IAppConfigRepository.js';
import AppConfig from '../../domain/entities/AppConfig.js';
import configData from '../../data/config.json' assert { type: "json" }; // Direct import

export class JsonAppConfigRepository extends IAppConfigRepository {
    constructor() {
        super();
        // Basic validation of imported configData
        if (!configData || !Array.isArray(configData.availableYears)) {
            throw new Error("JsonAppConfigRepository: Invalid or missing config.json data. Expected { availableYears: [...] }");
        }
        // Further validation that availableYears contains numbers
        if (!configData.availableYears.every(year => typeof year === 'number' && Number.isInteger(year))) {
            throw new Error("JsonAppConfigRepository: config.json availableYears must be an array of integer numbers.");
        }
        // Validation for rehearsalSettings
        if (!Array.isArray(configData.rehearsalSettings)) {
            // Allow it to be missing or an empty array. If it exists, it must be an array.
            if (configData.rehearsalSettings !== undefined) {
                 throw new Error("JsonAppConfigRepository: config.json rehearsalSettings must be an array if present.");
            }
        }
    }

    /**
     * Retrieves the application configuration from config.json.
     * @returns {Promise<AppConfig>} A promise that resolves to an AppConfig instance.
     */
    async getAppConfig() {
        // configData is already loaded by the import statement.
        // The AppConfig constructor handles sorting and validation of year types.
        return new AppConfig(configData.availableYears);
    }

    /**
     * Retrieves the rehearsal settings from config.json.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of rehearsal configuration objects.
     */
    async getRehearsalSettings() {
        // Returns rehearsalSettings array or an empty array if not defined.
        return configData.rehearsalSettings || [];
    }
}
