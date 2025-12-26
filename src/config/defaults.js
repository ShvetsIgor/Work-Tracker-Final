export const defaultSettings = {
  language: 'ru',
  currency: 'ILS',
  theme: 'dark',
  workType: 'hourly', // 'hourly' или 'ppienceWork'
  hourlyRate: 30,
  enableOvertime: true,
  unpaidLunch: false,
  lunchDuration: 30,
  tipsCardPercent: 35,
  enabledFields: {
    mileage: true,
    tipsCash: true,
    tipsCard: true,
    expenses: true,
    bonus: true
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
