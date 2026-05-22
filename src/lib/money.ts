/**
 * Formats a numeric money value to a two-decimal-place string.
 * Handles string (from DB numeric columns), number, null, and undefined inputs.
 */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '0.00';
  return parseFloat(String(value)).toFixed(2);
}
