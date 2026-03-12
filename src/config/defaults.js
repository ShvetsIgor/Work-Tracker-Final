export const defaultSettings = {
  language: 'ru',
  currency: 'ILS',
  theme: 'dark',
  colorPalette: 'journal',
  workType: 'hourly', // 'hourly' или 'pieceWork'
  hourlyRate: 30,
  enableOvertime: true,
  fridayOvertime: true,
  unpaidLunch: false,
  lunchDuration: 30,
  tipsCardPercent: 35,
  enabledFields: {
    mileage: true,
    tipsCash: true,
    tipsCard: true,
    expenses: true,
    bonus: true
  },
  statisticsFields: {
    totalHours: true,
    totalEarnings: true,
    avgPerHour: true,
    tipsCash: true,
    tipsCard: true,
    mileage: true,
    expenses: true,
    bonus: true,
    avgHoursPerShift: true,
    avgIncomePerShift: true,
    expenseDetails: true
  }
};

export const expenseTypes = [
  { id: 'fuel', icon: '⛽' },
  { id: 'tireRepair', icon: '🛞' },
  { id: 'carRepair', icon: '🔧' },
  { id: 'parking', icon: '🅿️' },
  { id: 'food', icon: '🍔' },
  { id: 'other', icon: '📦' }
];

export const periodOptions = [
  { id: 'today', days: 0 },
  { id: 'thisWeek', days: 7 },
  { id: 'thisMonth', days: 30 },
  { id: 'custom', days: null }
];
