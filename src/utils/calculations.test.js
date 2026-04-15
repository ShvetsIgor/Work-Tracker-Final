import { describe, expect, it } from 'vitest';
import {
  calculateEarnings,
  calculateMileage,
  calculateNetTipsCard,
  calculateShiftBaseEarnings,
  calculateShiftNetIncome,
  calculateStatistics,
  calculateTotalExpenses,
  validateShift
} from './calculations';
import { defaultSettings } from '@/config/defaults';

const createSettings = (overrides = {}) => ({
  ...defaultSettings,
  ...overrides
});

describe('calculateEarnings', () => {
  it('calculates regular hourly earnings without overtime', () => {
    const settings = createSettings({ hourlyRate: 40, enableOvertime: false });

    expect(calculateEarnings(8 * 60, settings, '2026-03-10')).toBe(320);
  });

  it('calculates overtime for a regular workday', () => {
    const settings = createSettings({ hourlyRate: 30, enableOvertime: true, fridayOvertime: true });

    expect(calculateEarnings(10 * 60, settings, '2026-03-10')).toBe(315);
    expect(calculateEarnings(11 * 60, settings, '2026-03-10')).toBe(360);
  });

  it('calculates overtime for Friday using the shorter threshold', () => {
    const settings = createSettings({ hourlyRate: 30, enableOvertime: true, fridayOvertime: true });

    expect(calculateEarnings(7 * 60, settings, '2026-03-13')).toBe(240);
  });

  it('subtracts unpaid lunch before calculating hourly earnings', () => {
    const settings = createSettings({
      hourlyRate: 20,
      enableOvertime: false,
      unpaidLunch: true,
      lunchDuration: 30
    });

    expect(calculateEarnings(8 * 60, settings, '2026-03-10')).toBe(150);
  });
});

describe('tips and shift income helpers', () => {
  it('calculates net card tips after deduction', () => {
    expect(calculateNetTipsCard(100, 35)).toBe(65);
  });

  it('uses earnedAmount as base earnings for piece-work shifts', () => {
    const settings = createSettings({ workType: 'pieceWork' });
    const shift = { totalMinutes: 300, earnedAmount: 540 };

    expect(calculateShiftBaseEarnings(shift, settings)).toBe(540);
  });

  it('calculates net income including tips, bonus and expenses', () => {
    const settings = createSettings({
      workType: 'pieceWork',
      tipsCardPercent: 20
    });
    const shift = {
      totalMinutes: 300,
      earnedAmount: 500,
      tipsCash: 50,
      tipsCard: 100,
      bonus: 20,
      expenses: [{ amount: 30 }]
    };

    expect(calculateShiftNetIncome(shift, settings)).toBe(620);
  });
});

describe('calculateStatistics', () => {
  it('aggregates piece-work statistics correctly', () => {
    const settings = createSettings({
      workType: 'pieceWork',
      tipsCardPercent: 10
    });
    const shifts = [
      {
        date: '2026-03-10',
        totalMinutes: 300,
        earnedAmount: 200,
        ordersCount: 10,
        tipsCash: 20,
        tipsCard: 50,
        mileage: 12,
        bonus: 10,
        expenses: [{ type: 'fuel', amount: 15 }]
      },
      {
        date: '2026-03-11',
        totalMinutes: 180,
        earnedAmount: 150,
        ordersCount: 6,
        tipsCash: 0,
        tipsCard: 0,
        mileage: 5,
        bonus: 0,
        expenses: []
      }
    ];

    const stats = calculateStatistics(shifts, settings);

    expect(stats.totalEarnings).toBe(350);
    expect(stats.totalOrders).toBe(16);
    expect(stats.totalTipsCash).toBe(20);
    expect(stats.totalTipsCard).toBe(45);
    expect(stats.totalExpenses).toBe(15);
    expect(stats.totalMileage).toBe(17);
    expect(stats.netIncome).toBe(410);
    expect(stats.avgMinutesPerShift).toBe(240);
  });
});

describe('validateShift', () => {
  it('rejects empty or impossible work time', () => {
    expect(validateShift({ date: '', totalMinutes: 0 }).isValid).toBe(false);
    expect(validateShift({ date: '2026-03-10', totalMinutes: 24 * 60 + 1 }).isValid).toBe(false);
  });

  it('rejects missing date', () => {
    expect(validateShift({ date: '', totalMinutes: 480 }).isValid).toBe(false);
    expect(validateShift({ date: '', totalMinutes: 480 }).errors).toContain('Date is required');
  });

  it('rejects negative minutes', () => {
    expect(validateShift({ date: '2026-03-10', totalMinutes: -1 }).isValid).toBe(false);
  });

  it('accepts exactly 24 hours', () => {
    expect(validateShift({ date: '2026-03-10', totalMinutes: 24 * 60 }).isValid).toBe(true);
  });

  it('accepts a valid shift payload', () => {
    expect(validateShift({ date: '2026-03-10', totalMinutes: 480 }).isValid).toBe(true);
  });
});

describe('calculateTotalExpenses', () => {
  it('sums all expense amounts', () => {
    const expenses = [{ amount: 50 }, { amount: 30 }, { amount: 20 }];
    expect(calculateTotalExpenses(expenses)).toBe(100);
  });

  it('handles missing amount gracefully', () => {
    expect(calculateTotalExpenses([{ amount: 10 }, {}])).toBe(10);
  });

  it('returns 0 for empty or null input', () => {
    expect(calculateTotalExpenses([])).toBe(0);
    expect(calculateTotalExpenses(null)).toBe(0);
    expect(calculateTotalExpenses(undefined)).toBe(0);
  });
});

describe('calculateMileage', () => {
  it('calculates distance from odometer readings', () => {
    expect(calculateMileage(10000, 10150)).toBe(150);
  });

  it('returns 0 when end is less than start', () => {
    expect(calculateMileage(10150, 10000)).toBe(0);
  });

  it('handles string input', () => {
    expect(calculateMileage('100', '250')).toBe(150);
  });

  it('returns 0 for missing input', () => {
    expect(calculateMileage(null, null)).toBe(0);
  });
});

describe('calculateEarnings edge cases', () => {
  it('returns 0 for zero hourly rate', () => {
    const settings = createSettings({ hourlyRate: 0, enableOvertime: false });
    expect(calculateEarnings(8 * 60, settings, '2026-03-10')).toBe(0);
  });

  it('applies 150% rate on regular day beyond 10 hours', () => {
    const settings = createSettings({ hourlyRate: 20, enableOvertime: true, fridayOvertime: true });
    // 12h: 8h*20 + 2h*25 + 2h*30 = 160 + 50 + 60 = 270
    expect(calculateEarnings(12 * 60, settings, '2026-03-10')).toBe(270);
  });

  it('applies 150% rate on Friday beyond 6 hours', () => {
    const settings = createSettings({ hourlyRate: 20, enableOvertime: true, fridayOvertime: true });
    // 8h Friday: 4h*20 + 2h*25 + 2h*30 = 80 + 50 + 60 = 190
    expect(calculateEarnings(8 * 60, settings, '2026-03-13')).toBe(190);
  });

  it('ignores Friday rules when fridayOvertime is disabled', () => {
    const settings = createSettings({ hourlyRate: 20, enableOvertime: true, fridayOvertime: false });
    // Treated as regular day: 4h <= 8h threshold → 4h*20 = 80
    expect(calculateEarnings(4 * 60, settings, '2026-03-13')).toBe(80);
  });
});

describe('calculateStatistics hourly mode', () => {
  it('aggregates hourly statistics correctly', () => {
    const settings = createSettings({ hourlyRate: 20, enableOvertime: false, tipsCardPercent: 0 });
    const shifts = [
      { date: '2026-03-10', totalMinutes: 480, tipsCash: 10, tipsCard: 0, bonus: 0, expenses: [] },
      { date: '2026-03-11', totalMinutes: 480, tipsCash: 0,  tipsCard: 0, bonus: 5, expenses: [{ type: 'fuel', amount: 15 }] },
    ];

    const stats = calculateStatistics(shifts, settings);

    expect(stats.shiftsCount).toBe(2);
    expect(stats.totalEarnings).toBe(320);
    expect(stats.totalTipsCash).toBe(10);
    expect(stats.totalBonus).toBe(5);
    expect(stats.totalExpenses).toBe(15);
    expect(stats.netIncome).toBe(320);
    expect(stats.expensesByType.fuel).toBe(15);
  });

  it('returns zero-filled stats for empty shifts array', () => {
    const stats = calculateStatistics([], createSettings());
    expect(stats.shiftsCount).toBe(0);
    expect(stats.netIncome).toBe(0);
    expect(stats.avgPerHour).toBe(0);
  });

  it('collects bonusComments from shifts with both bonus and bonusComment', () => {
    const settings = createSettings({ hourlyRate: 20, enableOvertime: false });
    const shifts = [
      { date: '2026-03-10', totalMinutes: 480, bonus: 50, bonusComment: 'Good job', expenses: [] },
    ];

    const stats = calculateStatistics(shifts, settings);

    expect(stats.bonusComments).toHaveLength(1);
    expect(stats.bonusComments[0].comment).toBe('Good job');
  });
});
