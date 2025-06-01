// src/application/repositories/IAppConfigRepository.js
import AppConfig from '../../domain/entities/AppConfig.js';

/**
 * Interface for accessing application configuration.
 */
export class IAppConfigRepository {
    /**
     * Retrieves the application configuration.
     * @returns {Promise<AppConfig>} A promise that resolves to an AppConfig instance.
     */
    async getAppConfig() {
        throw new Error('Method not implemented: getAppConfig');
    }
}
