/**
 * Utility functions for tax calculations
 */

// Global tax rate for the application (5%)
export const TAX_RATE = 0.05;

/**
 * Calculate tax amount based on a value
 * @param {number} amount - The amount to calculate tax on
 * @param {boolean} includeDelivery - Whether to include delivery in tax calculation
 * @param {number} deliveryFee - The delivery fee amount
 * @returns {number} The calculated tax amount
 */
export const calculateTax = (
  amount,
  includeDelivery = true,
  deliveryFee = 0
) => {
  const baseAmount = amount + (includeDelivery ? deliveryFee : 0);
  return roundToTwoDecimals(baseAmount * TAX_RATE);
};

/**
 * Round a number to two decimal places
 * @param {number} value - The value to round
 * @returns {number} The rounded value
 */
export const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

/**
 * Calculate total with tax
 * @param {number} subtotal - The subtotal amount
 * @param {number} deliveryFee - The delivery fee amount
 * @param {boolean} includeDelivery - Whether to include delivery in tax calculation
 * @returns {Object} Object containing tax and total
 */
export const calculateTotalWithTax = (
  subtotal,
  deliveryFee = 0,
  includeDelivery = true
) => {
  const tax = calculateTax(subtotal, includeDelivery, deliveryFee);
  const total = roundToTwoDecimals(subtotal + deliveryFee + tax);

  return {
    tax,
    total,
  };
};
