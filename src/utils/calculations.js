/**
 * Calculate earnings based on work time and settings
 * Supports overtime calculation according to Israeli labor law:
 * - First 8 hours: 100% rate
 * - Next 2 hours (8-10): 125% rate
 * - After 10 hours: 150% rate
 */
export const calculateEarnings = (totalMinutes, settings) => {
  const { hourlyRate, enableOvertime, unpaidLunch, lunchDuration } = settings;
  
  if (!hourlyRate || hourlyRate <= 0) return 0;
  
  let workMinutes = totalMinutes;
  
  // Subtract unpaid lunch if enabled
  if (unpaidLunch && lunchDuration > 0) {
    workMinutes = Math.max(0, workMinutes - lunchDuration);
  }
  
  const hours = workMinutes / 60;
  
  // If overtime calculation is disabled, use simple calculation
  if (!enableOvertime) {
    return hours * hourlyRate;
  }
  
  // Calculate with overtime rates
  let earnings = 0;
  
  if (hours <= 8) {
    // Regular hours only
    earnings = hours * hourlyRate;
  } else if (hours <= 10) {
    // Regular + first overtime tier (125%)
    earnings = 8 * hourlyRate + (hours - 8) * hourlyRate * 1.25;
  } else {
    // Regular + both overtime tiers
    earnings = 8 * hourlyRate + 2 * hourlyRate * 1.25 + (hours - 10) * hourlyRate * 1.5;
  }
  
  return earnings;
};

/**
 * Calculate net card tips after deduction
 */
export const calculateNetTipsCard = (tipsCard, tipsCardPercent) => {
  if (!tipsCard || tipsCard <= 0) return 0;
  const deduction = (tipsCardPercent || 0) / 100;
  return tipsCard * (1 - deduction);
};

/**
 * Calculate total expenses for a shift
 */
export const calculateTotalExpenses = (expenses) => {
  if (!expenses || !Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
};

/**
 * Calculate net income for a shift
 */
export const calculateShiftNetIncome = (shift, settings) => {
  const isHourly = settings.workType !== 'pieceWork';
  
  // For piece-work, use earnedAmount instead of calculated earnings
  const earnings = isHourly 
    ? calculateEarnings(shift.totalMinutes, settings)
    : (shift.earnedAmount || 0);
  
  const tipsCash = shift.tipsCash || 0;
  const netTipsCard = calculateNetTipsCard(shift.tipsCard, settings.tipsCardPercent);
  const bonus = shift.bonus || 0;
  const expenses = calculateTotalExpenses(shift.expenses);
  
  return earnings + tipsCash + netTipsCard + bonus - expenses;
};

/**
 * Calculate statistics for a list of shifts
 */
export const calculateStatistics = (shifts, settings) => {
  const isHourly = settings.workType !== 'pieceWork';
  
  if (!shifts || shifts.length === 0) {
    return {
      shiftsCount: 0,
      totalMinutes: 0,
      totalMileage: 0,
      totalTipsCash: 0,
      totalTipsCard: 0,
      totalTipsCardGross: 0,
      totalBonus: 0,
      totalExpenses: 0,
      totalEarnings: 0,
      totalOrders: 0,
      totalEarnedAmount: 0,
      netIncome: 0,
      avgMinutesPerShift: 0,
      avgIncomePerShift: 0,
      avgPerHour: 0,
      expensesByType: {}
    };
  }
  
  const stats = {
    shiftsCount: shifts.length,
    totalMinutes: 0,
    totalMileage: 0,
    totalTipsCash: 0,
    totalTipsCard: 0,
    totalTipsCardGross: 0,
    totalBonus: 0,
    totalExpenses: 0,
    totalEarnings: 0,
    totalOrders: 0,
    totalEarnedAmount: 0,
    netIncome: 0,
    expensesByType: {}
  };
  
  shifts.forEach(shift => {
    // Time
    stats.totalMinutes += shift.totalMinutes || 0;
    
    // Mileage
    stats.totalMileage += shift.mileage || 0;
    
    // Tips
    stats.totalTipsCash += shift.tipsCash || 0;
    stats.totalTipsCardGross += shift.tipsCard || 0;
    stats.totalTipsCard += calculateNetTipsCard(shift.tipsCard, settings.tipsCardPercent);
    
    // Bonus
    stats.totalBonus += shift.bonus || 0;
    
    // Orders and earned (for piece-work)
    stats.totalOrders += shift.ordersCount || 0;
    stats.totalEarnedAmount += shift.earnedAmount || 0;
    
    // Expenses
    const shiftExpenses = shift.expenses || [];
    shiftExpenses.forEach(exp => {
      stats.totalExpenses += exp.amount || 0;
      stats.expensesByType[exp.type] = (stats.expensesByType[exp.type] || 0) + (exp.amount || 0);
    });
    
    // Earnings (hourly or piece-work)
    if (isHourly) {
      stats.totalEarnings += calculateEarnings(shift.totalMinutes, settings);
    } else {
      stats.totalEarnings += shift.earnedAmount || 0;
    }
  });
  
  // Calculate net income
  stats.netIncome = stats.totalEarnings + stats.totalTipsCash + stats.totalTipsCard + stats.totalBonus - stats.totalExpenses;
  
  // Calculate averages
  stats.avgMinutesPerShift = Math.round(stats.totalMinutes / stats.shiftsCount);
  stats.avgIncomePerShift = stats.netIncome / stats.shiftsCount;
  
  // Calculate avg per hour (useful for piece-work)
  stats.avgPerHour = stats.totalMinutes > 0 
    ? stats.netIncome / (stats.totalMinutes / 60)
    : 0;
  
  return stats;
};

/**
 * Calculate mileage from odometer readings
 */
export const calculateMileage = (startOdometer, endOdometer) => {
  const start = parseFloat(startOdometer) || 0;
  const end = parseFloat(endOdometer) || 0;
  return Math.max(0, end - start);
};

/**
 * Validate shift data
 */
export const validateShift = (shift) => {
  const errors = [];
  
  if (!shift.date) {
    errors.push('Date is required');
  }
  
  if (shift.totalMinutes <= 0) {
    errors.push('Work time must be greater than 0');
  }
  
  if (shift.totalMinutes > 24 * 60) {
    errors.push('Work time cannot exceed 24 hours');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
