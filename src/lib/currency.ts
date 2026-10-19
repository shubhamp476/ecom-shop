/**
 * Currency utility helper for Indian Rupee (INR - ₹) formatting across the store & admin panel.
 */

export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_CODE = "INR";

/**
 * Formats a numeric value into standard Indian numbering system (e.g., ₹1,49,999.00 or ₹999)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${CURRENCY_SYMBOL}0`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
