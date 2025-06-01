// src/application/usecases/GetAppConfigUseCase.js
import AppConfig from '../../domain/entities/AppConfig.js';
// IAppConfigRepository will be injected (as per JSDoc).

export class GetAppConfigUseCase {
    /**
     * @param {IAppConfigRepository} appConfigRepository - An instance of a class implementing IAppConfigRepository.
     */
    constructor(appConfigRepository) {
        if (!appConfigRepository || typeof appConfigRepository.getAppConfig !== 'function') {
            throw new Error("GetAppConfigUseCase: appConfigRepository is invalid or missing getAppConfig method.");
        }
        this.appConfigRepository = appConfigRepository;
    }

    /**
     * Executes the use case to get application configuration.
     * @returns {Promise<AppConfig>}
     */
    async execute() {
        return this.appConfigRepository.getAppConfig();
    }
}
