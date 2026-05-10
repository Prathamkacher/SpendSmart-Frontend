import { buildYearRange, toDateInputValue, MONTH_OPTIONS } from './date.utils';

describe('DateUtils', () => {
  it('should build year range', () => {
    const range = buildYearRange(2023, 1, 1);
    expect(range).toEqual([2022, 2023, 2024]);
  });

  it('should convert date to input value string', () => {
    const dateStr = '2023-05-15T12:00:00.000Z';
    const result = toDateInputValue(dateStr);
    expect(result).toBe('2023-05-15');
  });

  it('should have 12 month options', () => {
    expect(MONTH_OPTIONS.length).toBe(12);
  });
});
