/**
 * Asynchronously loads yearly data (events, exceptional dates, and timespans) for a given year.
 *
 * @param {string|number} year The year for which to load data.
 * @returns {Promise<object>} A promise that resolves to an object containing
 *                            `events` (array), `exceptionalDates` (array), 
 *                            and `exceptionalTimespans` (array).
 *                            If the specific year's data file is not found or an error occurs,
 *                            it returns an object with empty arrays for all three properties.
 */
export const getYearlyData = async (year) => {
  try {
    // Dynamically import the JSON file for the given year from the main /data directory.
    const yearlyDataModule = await import(`../data/${year}.json`);

    // Handle ES module default export for JSON if present, otherwise use the module itself.
    // This also covers cases where the JSON might not have a .default (e.g. some bundler outputs)
    const data = yearlyDataModule.default !== undefined ? yearlyDataModule.default : yearlyDataModule;

    // Basic validation for expected structure
    // Ensure all three expected keys are present and are arrays.
    if (typeof data === 'object' && data !== null &&
        data.hasOwnProperty('events') && Array.isArray(data.events) &&
        data.hasOwnProperty('exceptionalDates') && Array.isArray(data.exceptionalDates) &&
        data.hasOwnProperty('exceptionalTimespans') && Array.isArray(data.exceptionalTimespans)) {
      return data;
    }
    // console.warn(`Data file ${year}.json has unexpected structure. Content:`, data);
    return { events: [], exceptionalDates: [], exceptionalTimespans: [] };
  } catch (error) {
    // console.warn(`Could not load data for year ${year}:`, error.message);
    // If the file doesn't exist or another error occurs during import, return default empty structure.
    return { events: [], exceptionalDates: [], exceptionalTimespans: [] };
  }
};
