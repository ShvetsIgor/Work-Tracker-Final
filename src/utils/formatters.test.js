import { describe, expect, it } from 'vitest';
import {
  capitalize,
  formatCurrency,
  formatCurrencyWithSign,
  formatDecimalHours,
  formatMileage,
  formatNumber,
  formatPercent,
  formatTime,
  formatTimeLabeled,
  truncateText,
} from './formatters';

describe('formatCurrency', () => {
  it('formats whole numbers without decimals', () => {
    expect(formatCurrency(100, 'ILS')).toBe('₪ 100');
  });

  it('formats decimal amounts with two decimal places', () => {
    expect(formatCurrency(99.5, 'ILS')).toBe('₪ 99.50');
  });

  it('formats USD correctly', () => {
    expect(formatCurrency(50, 'USD')).toBe('$ 50');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(200, 'EUR')).toBe('€ 200');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'ILS')).toBe('₪ 0');
  });

  it('handles string input', () => {
    expect(formatCurrency('150', 'ILS')).toBe('₪ 150');
  });

  it('handles unknown currency code', () => {
    expect(formatCurrency(100, 'XYZ')).toBe('100.00');
  });

  it('defaults to ILS when no currency provided', () => {
    expect(formatCurrency(100)).toBe('₪ 100');
  });
});

describe('formatCurrencyWithSign', () => {
  it('shows no sign for positive values by default', () => {
    expect(formatCurrencyWithSign(100, 'ILS')).toBe('₪ 100');
  });

  it('shows + sign when showPositive is true', () => {
    expect(formatCurrencyWithSign(100, 'ILS', true)).toBe('+₪ 100');
  });

  it('shows - sign for negative values', () => {
    expect(formatCurrencyWithSign(-50, 'ILS')).toBe('-₪ 50');
  });

  it('handles zero', () => {
    expect(formatCurrencyWithSign(0, 'ILS', true)).toBe('₪ 0');
  });
});

describe('formatTime', () => {
  it('formats minutes to H:MM', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(485)).toBe('8:05');
    expect(formatTime(0)).toBe('0:00');
  });

  it('handles values over 24 hours', () => {
    expect(formatTime(25 * 60)).toBe('25:00');
  });
});

describe('formatTimeLabeled', () => {
  const t = { hoursShort: 'h', minutesShort: 'm' };

  it('shows hours and minutes', () => {
    expect(formatTimeLabeled(90, t)).toBe('1h 30m');
  });

  it('shows only minutes when under an hour', () => {
    expect(formatTimeLabeled(45, t)).toBe('45m');
  });

  it('shows only hours when minutes are zero', () => {
    expect(formatTimeLabeled(120, t)).toBe('2h');
  });

  it('shows 0m for zero minutes', () => {
    expect(formatTimeLabeled(0, t)).toBe('0m');
  });
});

describe('formatDecimalHours', () => {
  it('converts minutes to decimal hours with 2 decimals', () => {
    expect(formatDecimalHours(90)).toBe('1.50');
    expect(formatDecimalHours(480)).toBe('8.00');
  });
});

describe('formatNumber', () => {
  it('formats integers without decimals', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('formats with decimals', () => {
    expect(formatNumber(1234.5, 2)).toBe('1,234.50');
  });

  it('handles string input', () => {
    expect(formatNumber('500')).toBe('500');
  });

  it('returns 0 for invalid input', () => {
    expect(formatNumber(null)).toBe('0');
  });
});

describe('formatPercent', () => {
  it('formats as percentage string', () => {
    expect(formatPercent(35)).toBe('35%');
  });

  it('formats with decimals', () => {
    expect(formatPercent(12.5, 1)).toBe('12.5%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });
});

describe('formatMileage', () => {
  const t = { km: 'км' };

  it('formats mileage with label', () => {
    expect(formatMileage(150, t)).toBe('150 км');
  });

  it('handles zero', () => {
    expect(formatMileage(0, t)).toBe('0 км');
  });

  it('falls back to km if no translation', () => {
    expect(formatMileage(100, {})).toBe('100 km');
  });
});

describe('truncateText', () => {
  it('truncates text longer than maxLength', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });

  it('does not truncate short text', () => {
    expect(truncateText('Hi', 10)).toBe('Hi');
  });

  it('returns input unchanged when at exact maxLength', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('handles null/empty input', () => {
    expect(truncateText(null)).toBe(null);
    expect(truncateText('')).toBe('');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('leaves rest of string unchanged', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles null', () => {
    expect(capitalize(null)).toBe('');
  });
});
