export const MONTH_OPTIONS = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
];

export function buildYearRange(
  currentYear: number = new Date().getFullYear(),
  previousYears: number = 2,
  nextYears: number = 1
): number[] {
  return Array.from(
    { length: previousYears + nextYears + 1 },
    (_, index) => currentYear - previousYears + index
  );
}

export function toDateInputValue(value: string | Date): string {
  return new Date(value).toISOString().split('T')[0];
}
