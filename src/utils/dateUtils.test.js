import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calculateBreakDuration,
  formatTime,
  getDateRange,
  getEffectiveDate,
  isDateInRange,
  parseTimeToMinutes
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
});
