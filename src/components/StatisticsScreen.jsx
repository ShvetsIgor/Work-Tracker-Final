import React, { useState, useMemo } from 'react';
import { 
  Clock, DollarSign, Banknote, CreditCard, Car, Receipt, Gift, 
  TrendingUp, Calendar, BarChart3, Package, ChevronDown, ChevronUp, List
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, EmptyState } from '@/components/ui';
import { getDateRange, isDateInRange, formatDate } from '@/utils/dateUtils';
import { calculateStatistics, calculateEarnings } from '@/utils/calculations';
import { formatCurrency, formatTime, formatTimeLabeled } from '@/utils/formatters';

const StatCard = ({ icon: Icon, label, value, color = 'theme-text-primary', subValue }) => (
  <Card className="p-3">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      <span className="theme-text-muted text-xs">{label}</span>
    </div>
    <div className={`font-bold text-lg ${color}`}>
      {value}
    </div>
    {subValue && (
      <div className="theme-text-muted text-xs mt-1">{subValue}</div>
    )}
  </Card>
);

const ExpenseBreakdown = ({ expensesByType, currency, t, isDark }) => {
  if (Object.keys(expensesByType).length === 0) return null;
  
  const total = Object.values(expensesByType).reduce((sum, val) => sum + val, 0);
  
  return (
    <Card className="p-4">
      <h3 className="theme-text-primary font-semibold mb-4 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-red-400" />
        {t.expenseDetails}
      </h3>
      <div className="space-y-3">
        {Object.entries(expensesByType)
          .sort(([, a], [, b]) => b - a)
          .map(([type, amount]) => {
            const percentage = (amount / total * 100).toFixed(0);
            return (
              <div key={type}>
                <div className="flex justify-between items-center mb-1">
                  <span className="theme-text-secondary">{t[type] || type}</span>
                  <span className="text-red-400 font-medium">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </Card>
  );
};

const StatisticsScreen = () => {
  const { t, shifts, settings } = useApp();
  const { enabledFields, currency, statisticsFields } = settings;
  const sf = statisticsFields || {}; // Safe access
  const isHourly = settings.workType !== 'pieceWork';
  const isDark = settings.theme !== 'light';
  
  // Calculate previous FULL month (e.g., in January 2026 show December 1-31, 2025)
  const getPrevMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed, so January = 0
    
    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    
    // First day of previous month
    const firstDay = new Date(prevYear, prevMonth, 1);
    // Last day of previous month
    const lastDay = new Date(prevYear, prevMonth + 1, 0);
    
    // Format as YYYY-MM-DD without timezone issues
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    return {
      from: formatDate(firstDay),
      to: formatDate(lastDay)
    };
  };
  
  const prevMonth = getPrevMonthDates();
  const [period, setPeriod] = useState('thisMonth');
  const [customFrom, setCustomFrom] = useState(prevMonth.from);
  const [customTo, setCustomTo] = useState(prevMonth.to);
  
  // Filter shifts based on selected period
  const filteredShifts = useMemo(() => {
    const { startDate, endDate } = getDateRange(period, customFrom, customTo);
    return shifts.filter(shift => isDateInRange(shift.date, startDate, endDate));
  }, [shifts, period, customFrom, customTo]);
  
  // Calculate statistics - key includes period to force recalculation
  const stats = useMemo(() => {
    return calculateStatistics(filteredShifts, settings);
  }, [filteredShifts, settings, period, customFrom, customTo]);
  
  const periodButtons = [
    { id: 'today', label: t.today },
    { id: 'thisWeek', label: t.thisWeek },
    { id: 'thisMonth', label: t.thisMonth },
    { id: 'custom', label: t.custom }
  ];
  
  const formatTipsCardValue = () => {
    if (settings.tipsCardPercent > 0 && stats.totalTipsCardGross > 0) {
      const gross = formatCurrency(stats.totalTipsCardGross, currency);
      const net = formatCurrency(stats.totalTipsCard, currency);
      return `${gross} (${net})`;
    }
    return formatCurrency(stats.totalTipsCard, currency);
  };
  
  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold theme-text-primary mb-6">{t.statistics}</h1>
      
      <Card className="p-4 mb-6">
        <label className="block theme-text-muted text-sm mb-3">{t.selectPeriod}</label>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {periodButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriod(btn.id)}
              className={`py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                period === btn.id
                  ? 'bg-purple-500 text-white'
                  : isDark 
                    ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        
        {period === 'custom' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block theme-text-muted text-xs mb-1">{t.from}</label>
              <input 
                type="date" 
                value={customFrom} 
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full theme-bg-input rounded-xl px-3 py-2 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1">
              <label className="block theme-text-muted text-xs mb-1">{t.to}</label>
              <input 
                type="date" 
                value={customTo} 
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full theme-bg-input rounded-xl px-3 py-2 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </Card>
      
      {filteredShifts.length === 0 ? (
        <EmptyState icon={BarChart3} title={t.noData} />
      ) : (
        <div className="space-y-4" key={`${period}-${customFrom}-${customTo}`}>
          {/* Net income header */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span className="theme-text-secondary">{t.netIncome}</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {formatCurrency(stats.netIncome, currency)}
            </div>
            <div className="theme-text-muted text-sm">
              {stats.shiftsCount} {t.shiftsCount} • {formatTimeLabeled(stats.totalMinutes, t)}
            </div>
          </div>
          
          {/* Stats grid - filtered by settings */}
          <div className="grid grid-cols-2 gap-3">
            {sf.totalHours !== false && (
              <StatCard 
                icon={Clock} 
                label={t.totalHours} 
                value={formatTime(stats.totalMinutes)} 
                subValue={`${stats.shiftsCount} ${t.shiftsCount}`} 
              />
            )}
            
            {sf.totalEarnings !== false && (
              <StatCard 
                icon={DollarSign} 
                label={isHourly ? t.totalEarnings : t.earnedAmount} 
                value={formatCurrency(stats.totalEarnings, currency)} 
                color="text-green-400" 
              />
            )}
            
            {sf.avgPerHour !== false && (
              <StatCard 
                icon={TrendingUp} 
                label={t.avgPerHour} 
                value={formatCurrency(stats.avgPerHour, currency)} 
                color="text-purple-400" 
              />
            )}
            
            {!isHourly && stats.totalOrders > 0 && (
              <StatCard 
                icon={Package} 
                label={t.orders} 
                value={stats.totalOrders} 
                color="text-blue-400" 
              />
            )}
            
            {sf.tipsCash !== false && enabledFields.tipsCash && stats.totalTipsCash > 0 && (
              <StatCard 
                icon={Banknote} 
                label={t.totalTipsCash} 
                value={formatCurrency(stats.totalTipsCash, currency)} 
                color="text-green-400" 
              />
            )}
            
            {sf.tipsCard !== false && enabledFields.tipsCard && stats.totalTipsCard > 0 && (
              <StatCard 
                icon={CreditCard} 
                label={t.totalTipsCard} 
                value={formatTipsCardValue()} 
                color="text-green-400" 
                subValue={settings.tipsCardPercent > 0 ? `${t.deduction}: ${settings.tipsCardPercent}%` : undefined} 
              />
            )}
            
            {sf.mileage !== false && enabledFields.mileage && stats.totalMileage > 0 && (
              <StatCard 
                icon={Car} 
                label={t.totalMileageStats} 
                value={`${stats.totalMileage} ${t.km}`} 
              />
            )}
            
            {sf.expenses !== false && enabledFields.expenses && stats.totalExpenses > 0 && (
              <StatCard 
                icon={Receipt} 
                label={t.totalExpenses} 
                value={formatCurrency(stats.totalExpenses, currency)} 
                color="text-red-400" 
              />
            )}
            
            {enabledFields.bonus && stats.totalBonus > 0 && (
              <StatCard 
                icon={Gift} 
                label={t.totalBonus} 
                value={formatCurrency(stats.totalBonus, currency)} 
                color="text-yellow-400" 
              />
            )}
            
            {sf.avgHoursPerShift !== false && (
              <StatCard 
                icon={Calendar} 
                label={t.avgHoursPerShift} 
                value={formatTime(stats.avgMinutesPerShift)} 
              />
            )}
            
            {sf.avgIncomePerShift !== false && (
              <StatCard 
                icon={TrendingUp} 
                label={t.avgIncomePerShift} 
                value={formatCurrency(stats.avgIncomePerShift, currency)} 
                color="text-purple-400" 
              />
            )}
          </div>
          
          {sf.expenseDetails !== false && enabledFields.expenses && (
            <ExpenseBreakdown expensesByType={stats.expensesByType} currency={currency} t={t} isDark={isDark} />
          )}
          
          {/* Shifts list for selected period */}
          <ShiftsList shifts={filteredShifts} settings={settings} t={t} isDark={isDark} />
        </div>
      )}
    </div>
  );
};

// Collapsible shifts list
const ShiftsList = ({ shifts, settings, t, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currency } = settings;
  
  if (shifts.length === 0) return null;
  
  // Sort by date descending
  const sortedShifts = [...shifts].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-blue-400" />
          <span className="theme-text-primary font-semibold">
            {isOpen ? t.hideShiftsList || 'Скрыть смены' : t.showShiftsList || 'Список смен'}
          </span>
          <span className="theme-text-muted text-sm">({shifts.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 theme-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 theme-text-muted" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-slate-700/30">
          {sortedShifts.map((shift) => {
            const baseEarnings = calculateEarnings(shift.totalMinutes, settings, shift.date);
            return (
              <div 
                key={shift.id}
                className={`px-4 py-3 flex items-center justify-between border-b last:border-b-0 ${
                  isDark ? 'border-slate-700/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="theme-text-secondary text-sm min-w-[90px]">
                    {formatDate(shift.date, settings.language)}
                  </span>
                  <span className="theme-text-muted text-sm">
                    {formatTime(shift.totalMinutes)}
                  </span>
                </div>
                <span className="text-green-400 font-medium">
                  {formatCurrency(baseEarnings, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default StatisticsScreen;
