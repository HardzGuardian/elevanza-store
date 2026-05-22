/**
 * Escapes a value for safe inclusion in a CSV cell.
 * Wraps in double-quotes and escapes any internal double-quotes.
 */
export function escapeCell(value: string | number | null | undefined): string {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}
