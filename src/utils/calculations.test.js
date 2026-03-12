import { describe, expect, it } from 'vitest';
import {
  calculateEarnings,
  calculateNetTipsCard,
  calculateShiftBaseEarnings,
  calculateShiftNetIncome,
  calculateStatistics,
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

  it('accepts a valid shift payload', () => {
    expect(validateShift({ date: '2026-03-10', totalMinutes: 480 }).isValid).toBe(true);
  });
});
