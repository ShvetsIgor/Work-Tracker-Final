import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calculateBreakDuration,
  formatDate,
  formatDateFull,
  formatTime,
  formatTimeWithLabels,
  getDateRange,
  getEffectiveDate,
  isDateInRange,
  isToday,
  isYesterday,
  parseTimeToMinutes,
  getTodayString,
} from './dateUtils';

describe('getEffectiveDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the previous date for entries before 03:00', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T02:30:00'));

    expect(getEffectiveDate()).toBe('2026-03-11');
  });

  it('uses the current date after 03:00', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T09:15:00'));

    expect(getEffectiveDate()).toBe('2026-03-12');
  });
});

describe('time helpers', () => {
  it('parses HH:MM strings to minutes', () => {
    expect(parseTimeToMinutes('08:45')).toBe(525);
  });

  it('calculates overnight break durations', () => {
    expect(calculateBreakDuration('23:30', '00:15')).toBe(45);
  });

  it('formats minutes as hours and minutes', () => {
    expect(formatTime(485)).toBe('8:05');
  });
});

describe('date range helpers', () => {
  it('builds a custom range and checks dates within it', () => {
    const { startDate, endDate } = getDateRange('custom', '2026-03-01', '2026-03-31');

    expect(isDateInRange('2026-03-15', startDate, endDate)).toBe(true);
    expect(isDateInRange('2026-04-01', startDate, endDate)).toBe(false);
  });

  it('returns false for an invalid date string', () => {
    const { startDate, endDate } = getDateRange('custom', '2026-03-01', '2026-03-31');
    expect(isDateInRange('not-a-date', startDate, endDate)).toBe(false);
  });

  it('getDateRange today returns a range that contains today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00'));

    const { startDate, endDate } = getDateRange('today');
    expect(isDateInRange('2026-03-15', startDate, endDate)).toBe(true);
    expect(isDateInRange('2026-03-14', startDate, endDate)).toBe(false);

    vi.useRealTimers();
  });

  it('falls back to thisMonth for unknown period', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00'));

    const { startDate, endDate } = getDateRange('unknown');
    expect(isDateInRange('2026-03-01', startDate, endDate)).toBe(true);
    expect(isDateInRange('2026-02-28', startDate, endDate)).toBe(false);

    vi.useRealTimers();
  });
});

describe('parseTimeToMinutes edge cases', () => {
  it('returns 0 for empty or null input', () => {
    expect(parseTimeToMinutes('')).toBe(0);
    expect(parseTimeToMinutes(null)).toBe(0);
  });

  it('handles midnight correctly', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('00:01')).toBe(1);
  });
});

describe('calculateBreakDuration edge cases', () => {
  it('returns 0 for missing inputs', () => {
    expect(calculateBreakDuration('', '')).toBe(0);
    expect(calculateBreakDuration(null, null)).toBe(0);
  });

  it('calculates normal (non-overnight) break', () => {
    expect(calculateBreakDuration('12:00', '13:30')).toBe(90);
  });
});

describe('formatDate', () => {
  it('formats a date string in Russian', () => {
    const result = formatDate('2026-03-10', 'ru');
    expect(result).toMatch(/10/);
  });

  it('formats a full date', () => {
    const result = formatDateFull('2026-03-10', 'en');
    expect(result).toMatch(/March/);
    expect(result).toMatch(/2026/);
  });

  it('returns input on invalid date string', () => {
    expect(formatDate('not-a-date', 'ru')).toBe('not-a-date');
  });
});

describe('formatTimeWithLabels', () => {
  const t = { hoursShort: 'ч', minutesShort: 'м' };

  it('formats hours and minutes', () => {
    expect(formatTimeWithLabels(90, t)).toBe('1ч 30м');
  });

  it('shows only minutes when under an hour', () => {
    expect(formatTimeWithLabels(45, t)).toBe('45м');
  });

  it('shows only hours when minutes are zero', () => {
    expect(formatTimeWithLabels(120, t)).toBe('2ч');
  });
});

describe('isToday / isYesterday', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('isToday returns true for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T10:00:00'));

    expect(isToday('2026-03-15')).toBe(true);
    expect(isToday('2026-03-14')).toBe(false);
  });

  it('isYesterday returns true for yesterday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T10:00:00'));

    expect(isYesterday('2026-03-14')).toBe(true);
    expect(isYesterday('2026-03-15')).toBe(false);
  });

  it('getTodayString returns correct date string', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T10:00:00'));

    expect(getTodayString()).toBe('2026-03-15');
  });
});
