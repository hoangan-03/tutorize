import { Transform } from 'class-transformer';

/**
 * Transform Date to ISO date string (YYYY-MM-DD) for date-only fields
 */
export function ToDateString() {
  return Transform(({ value }) => {
    if (!value) return value;
    if (value instanceof Date) {
      // Return only the date part in YYYY-MM-DD format
      return value.toISOString().split('T')[0];
    }
    return value;
  });
}

/**
 * Transform string date input to Date object
 * Expects YYYY-MM-DD format and creates UTC midnight date
 */
export function FromDateString() {
  return Transform(({ value }) => {
    if (!value || typeof value !== 'string') return value;

    // Parse YYYY-MM-DD format to create date at UTC midnight
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed
  });
}
