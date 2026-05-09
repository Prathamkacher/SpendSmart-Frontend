import { buildYearRange, MONTH_OPTIONS, toDateInputValue } from './date.utils';

describe('date.utils', () => {
  it('exposes the full set of month options', () => {
    expect(MONTH_OPTIONS.length).toBe(12);
    expect(MONTH_OPTIONS[0]).toEqual({ value: 1, name: 'January' });
    expect(MONTH_OPTIONS[11]).toEqual({ value: 12, name: 'December' });
  });

  it('builds an inclusive year range around the current year', () => {
    expect(buildYearRange(2026, 2, 1)).toEqual([2024, 2025, 2026, 2027]);
    expect(buildYearRange(2026, 0, 0)).toEqual([2026]);
  });

  it('converts string and date inputs into yyyy-mm-dd values', () => {
    expect(toDateInputValue('2026-05-08T10:20:30.000Z')).toBe('2026-05-08');
    expect(toDateInputValue(new Date('2026-12-31T00:00:00.000Z'))).toBe('2026-12-31');
  });
});
