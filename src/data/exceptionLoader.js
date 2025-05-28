/**
 * Asynchronously loads exception data (exceptional dates and timespans) for a given year.
 *
 * @param {string|number} year The year for which to load exceptions.
 * @returns {Promise<object>} A promise that resolves to an object containing
 *                            `exceptionalDates` (array) and `exceptionalTimespans` (array).
 *                            If the specific year's exception file is not found,
 *                            it returns an object with empty arrays for both properties.
 */
export const getExceptionsByYear = async (year) => {
  try {
    // Dynamically import the JSON file for the given year.
    // Vite/Rollup handles JSON imports and provides the parsed object as the default export.
    const exceptionsModule = await import(`../data/exceptions/${year}.json`);
    // The actual data is usually in the .default property for JSON modules when using dynamic import
    // However, modern bundlers like Vite might directly return the object.
    // Let's check if .default exists and has the expected properties.
    if (exceptionsModule.default && typeof exceptionsModule.default === 'object' && 'exceptionalDates' in exceptionsModule.default && 'exceptionalTimespans' in exceptionsModule.default) {
      return exceptionsModule.default;
    }
    // If .default is not there or not as expected, but the module itself has the properties (Vite's behavior for JSON)
    if (typeof exceptionsModule === 'object' && 'exceptionalDates' in exceptionsModule && 'exceptionalTimespans' in exceptionsModule) {
        return exceptionsModule;
    }
    // If the structure is unexpected, return default empty state to prevent errors.
    console.warn(`Unexpected structure for exceptions file: ${year}.json. Returning empty exceptions.`);
    return { exceptionalDates: [], exceptionalTimespans: [] };
  } catch (error) {
    // Log the error for debugging purposes (optional, could be noisy if files often don't exist)
    // console.warn(`Could not load exceptions for year ${year}:`, error.message);
    // If the file doesn't exist or another error occurs during import, return default empty exceptions.
    return { exceptionalDates: [], exceptionalTimespans: [] };
  }
};
