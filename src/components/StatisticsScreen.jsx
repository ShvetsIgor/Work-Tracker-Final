import React, { useState, useMemo } from 'react';
import { 
  Clock, DollarSign, Banknote, CreditCard, Car, Receipt, Gift, 
  TrendingUp, Calendar, BarChart3, Package 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, Input, EmptyState } from '@/components/ui';
import { getDateRange, isDateInRange } from '@/utils/dateUtils';
import { calculateStatistics } from '@/utils/calculations';
import { formatCurrency, formatTime, formatTimeLabeled } from '@/utils/formatters';

const StatCard = ({ icon: Icon, label, value, color = 'theme-text-primary', subValue }) => (
  <Card className="p-4">
    <div className="flex items-center gap-3 mb-2">
      {Icon && <Icon className={`w-5 h-5 ${color}`} />}
      <span className="theme-text-muted text-sm">{label}</span>
    </div>
    <div className={`font-bold text-xl ${color}`}>
      {value}
    </div>
    {subValue && (
      <div className="theme-text-muted text-sm mt-1">{subValue}</div>
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
  const { enabledFields, currency } = settings;
  const isHourly = settings.workType !== 'pieceWork';
  const isDark = settings.theme !== 'light';
  
  const [period, setPeriod] = useState('thisMonth');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  
  const filteredShifts = useMemo(() => {
    const { startDate, endDate } = getDateRange(period, customFrom, customTo);
    return shifts.filter(shift => isDateInRange(shift.date, startDate, endDate));
  }, [shifts, period, customFrom, customTo]);
  
  const stats = useMemo(() => 
    calculateStatistics(filteredShifts, settings),
    [filteredShifts, settings]
  );
  
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
              className={`py-2 rounded-xl text-sm font-medium transition-all ${
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
              <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block theme-text-muted text-xs mb-1">{t.to}</label>
              <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          </div>
        )}
      </Card>
      
      {filteredShifts.length === 0 ? (
        <EmptyState icon={BarChart3} title={t.noData} />
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span className="theme-text-secondary">{t.netIncome}</span>
            </div>
            <div className="text-4xl font-bold theme-text-primary mb-2">
              {formatCurrency(stats.netIncome, currency)}
            </div>
            <div className="theme-text-muted text-sm">
              {stats.shiftsCount} {t.shiftsCount.toLowerCase()} • {formatTimeLabeled(stats.totalMinutes, t)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Clock} label={t.totalHours} value={formatTime(stats.totalMinutes)} subValue={`${stats.shiftsCount} ${t.shiftsCount.toLowerCase()}`} />
            
            <StatCard icon={DollarSign} label={isHourly ? t.totalEarnings : t.earnedAmount} value={formatCurrency(stats.totalEarnings, currency)} color="text-green-400" />
            
            <StatCard icon={TrendingUp} label={t.avgPerHour} value={formatCurrency(stats.avgPerHour, currency)} color="text-purple-400" />
            
            {!isHourly && stats.totalOrders > 0 && (
              <StatCard icon={Package} label={t.orders} value={stats.totalOrders} color="text-blue-400" />
            )}
            
            {enabledFields.tipsCash && stats.totalTipsCash > 0 && (
              <StatCard icon={Banknote} label={t.totalTipsCash} value={formatCurrency(stats.totalTipsCash, currency)} color="text-green-400" />
            )}
            
            {enabledFields.tipsCard && stats.totalTipsCard > 0 && (
              <StatCard icon={CreditCard} label={t.totalTipsCard} value={formatTipsCardValue()} color="text-green-400" subValue={settings.tipsCardPercent > 0 ? `${t.tipsCardPercent}: -${settings.tipsCardPercent}%` : undefined} />
            )}
            
            {enabledFields.mileage && stats.totalMileage > 0 && (
              <StatCard icon={Car} label={t.totalMileageStats} value={`${stats.totalMileage} ${t.km}`} />
            )}
            
            {enabledFields.expenses && stats.totalExpenses > 0 && (
              <StatCard icon={Receipt} label={t.totalExpenses} value={formatCurrency(stats.totalExpenses, currency)} color="text-red-400" />
            )}
            
            {enabledFields.bonus && stats.totalBonus > 0 && (
              <StatCard icon={Gift} label={t.totalBonus} value={formatCurrency(stats.totalBonus, currency)} color="text-yellow-400" />
            )}
            
            <StatCard icon={Calendar} label={t.avgHoursPerShift} value={formatTime(stats.avgMinutesPerShift)} />
            
            <StatCard icon={TrendingUp} label={t.avgIncomePerShift} value={formatCurrency(stats.avgIncomePerShift, currency)} color="text-purple-400" />
          </div>
          
          {enabledFields.expenses && (
            <ExpenseBreakdown expensesByType={stats.expensesByType} currency={currency} t={t} isDark={isDark} />
          )}
        </div>
      )}
    </div>
  );
};

export default StatisticsScreen;
