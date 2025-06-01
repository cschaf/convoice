class YearlyRawData {
    /**
     * Represents the raw data structure as found in a YYYY.json file.
     * @param {number} year - The year this data pertains to.
     * @param {object[]} events - Array of raw event objects.
     * @param {string[]} exceptionalDates - Array of date strings (YYYY-MM-DD).
     * @param {object[]} exceptionalTimespans - Array of objects with 'start' and 'end' date strings.
     */
    constructor(year, events = [], exceptionalDates = [], exceptionalTimespans = []) {
        if (typeof year !== 'number' || !Number.isInteger(year)) {
            throw new Error("YearlyRawData: year must be an integer number.");
        }
        if (!Array.isArray(events)) {
            throw new Error("YearlyRawData: events must be an array.");
        }
        if (!Array.isArray(exceptionalDates) || !exceptionalDates.every(date => typeof date === 'string')) {
            throw new Error("YearlyRawData: exceptionalDates must be an array of strings.");
        }
        if (!Array.isArray(exceptionalTimespans) || !exceptionalTimespans.every(span => typeof span === 'object' && span !== null && 'start' in span && 'end' in span)) {
            throw new Error("YearlyRawData: exceptionalTimespans must be an array of objects with 'start' and 'end' properties.");
        }

        this.year = year;
        this.events = events; // Raw event objects, not Event instances
        this.exceptionalDates = exceptionalDates;
        this.exceptionalTimespans = exceptionalTimespans;
    }

    // Example: Get count of items
    getEventCount() {
        return this.events.length;
    }

    getExceptionalDateCount() {
        return this.exceptionalDates.length;
    }

    getExceptionalTimespanCount() {
        return this.exceptionalTimespans.length;
    }
}

export default YearlyRawData;
