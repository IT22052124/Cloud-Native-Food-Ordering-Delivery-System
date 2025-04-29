// utils/dateUtils.js

/**
 * Get the ISO week number for a given date
 * @param {Date} date - The date to get week number for
 * @returns {number} - Week number (1-53)
 */
export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
};

/**
 * Get start and end dates for a given week number and year
 * @param {number} weekNumber - Week number (1-53)
 * @param {number} year - Year (e.g., 2025)
 * @returns {Object} - { startDate, endDate }
 */
export const getWeekDates = (weekNumber, year) => {
  // Create a date object for January 1st of the given year
  const januaryFirst = new Date(year, 0, 1);

  // Get the day of the week for January 1st (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = januaryFirst.getDay();

  // Calculate days to add to get to the first day (Monday) of week 1
  // If January 1st is Monday, we're already at week 1 day 1
  // If January 1st is Tuesday through Sunday, we need to move back to previous Monday
  const daysToFirstMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;

  // Create date for first Monday of week 1
  const firstMondayOfYear = new Date(year, 0, 1 + daysToFirstMonday);

  // Calculate the date for Monday of the requested week
  const startDate = new Date(firstMondayOfYear);
  startDate.setDate(firstMondayOfYear.getDate() + (weekNumber - 1) * 7);

  // Calculate the date for Sunday of the requested week
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  // Set to beginning and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
};

/**
 * Get the current week number and year
 * @returns {Object} - { weekNumber, year }
 */
export const getCurrentWeekInfo = () => {
  const now = new Date();
  return {
    weekNumber: getWeekNumber(now),
    year: now.getFullYear(),
  };
};

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateYMD = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Gets start and end dates for a month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2025)
 * @returns {Object} - { startDate, endDate }
 */
export const getMonthDates = (month, year) => {
  // Month is 1-based in the function params but 0-based in Date constructor
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Set to beginning and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
};

/**
 * Format a date in a human-readable format
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date (e.g., "Apr 21, 2025")
 */
export const formatDateReadable = (date) => {
  if (!date) return "";

  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
};

/**
 * Format currency value
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (default: "LKR")
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, currency = "LKR") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};
