class AppConfig {
    /**
     * @param {number[]} availableYears - An array of years (numbers) for which data is available.
     */
    constructor(availableYears = []) {
        if (!Array.isArray(availableYears) || !availableYears.every(year => typeof year === 'number' && Number.isInteger(year))) {
            throw new Error("AppConfig: availableYears must be an array of integer numbers.");
        }
        this.availableYears = availableYears.sort((a, b) => a - b); // Store sorted
    }

    // Example method: Get the most recent available year
    getMostRecentYear() {
        if (this.availableYears.length === 0) {
            return null;
        }
        return this.availableYears[this.availableYears.length - 1];
    }

    // Example method: Check if a specific year is available
    isYearAvailable(year) {
        return this.availableYears.includes(year);
    }

    // Example method: Add a new year to the available years, maintaining sort order
    addYear(year) {
        if (typeof year === 'number' && Number.isInteger(year) && !this.availableYears.includes(year)) {
            this.availableYears.push(year);
            this.availableYears.sort((a, b) => a - b);
        }
    }
}

export default AppConfig;
