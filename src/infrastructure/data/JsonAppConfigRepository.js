// src/infrastructure/data/JsonAppConfigRepository.js
import { IAppConfigRepository } from '../../application/repositories/IAppConfigRepository.js';
import AppConfig from '../../domain/entities/AppConfig.js';
import configData from '../../data/config.json'; // Direct import

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
}
