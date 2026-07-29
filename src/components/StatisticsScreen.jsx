import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, DollarSign, Banknote, CreditCard, Car, Receipt, Gift, 
  TrendingUp, Calendar, BarChart3, Package, ChevronDown, ChevronUp, List, Settings,
  Download, FileSpreadsheet, X, Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, EmptyState } from '@/components/ui';
import { getDateRange, isDateInRange, formatDate } from '@/utils/dateUtils';
import { calculateStatistics, calculateShiftBaseEarnings } from '@/utils/calculations';
import { formatCurrency, formatTime, formatTimeLabeled } from '@/utils/formatters';

const StatCard = ({ icon: Icon, label, value, color = 'theme-text-primary', subValue }) => (
  <Card className="h-full p-3">
    <div className="flex h-full flex-col justify-center">
      <div className="mb-1 flex items-center gap-1.5">
        {Icon && <Icon className={`h-3.5 w-3.5 ${color}`} />}
        <span className="theme-text-muted text-[11px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className={`text-base font-bold tracking-tight ${color}`}>
        {value}
      </div>
      {subValue && (
        <div className="theme-text-muted mt-1 text-xs">{subValue}</div>
      )}
    </div>
  </Card>
);

const MobileSectionLabel = ({ children }) => (
  <div className="theme-text-muted text-[11px] font-semibold uppercase tracking-[0.14em]">
    {children}
  </div>
);

const MobilePeriodPill = ({ options, value, onChange, isDark }) => (
  <div className={`flex rounded-xl border p-1 ${
    isDark ? 'border-white/[0.04] bg-slate-900/50' : 'border-slate-200 bg-slate-100'
  }`}>
    {options.map((option) => {
      const active = value === option.id;

      return (
        <button
          key={option.id}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(option.id)}
          className={`min-h-9 flex-1 rounded-lg px-2 py-2 text-[12px] font-semibold transition-all ${
            active
              ? isDark
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white text-slate-900 shadow-sm'
              : 'theme-text-muted hover:theme-text-secondary'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const MobileMiniStat = ({
  label,
  value,
  valueSecondLine,
  suffix,
  color = 'theme-text-primary',
  subValue,
  isDark
}) => (
  <div className={`min-w-0 rounded-xl border p-3 ${
    isDark ? 'border-white/[0.05] bg-slate-800/40' : 'border-slate-200 bg-white'
  }`}>
    <div className="theme-text-muted mb-1 truncate text-[11px]">{label}</div>
    <div className="flex min-w-0 items-baseline gap-1">
      <div className={`min-w-0 font-bold leading-tight tabular-nums ${
        subValue ? 'text-sm' : 'text-base'
      } ${color}`}>
        <div className={valueSecondLine ? 'whitespace-nowrap' : 'truncate'}>
          {value}
        </div>
        {valueSecondLine && (
          <div className="mt-0.5 whitespace-nowrap">{valueSecondLine}</div>
        )}
      </div>
      {suffix && <span className="theme-text-muted shrink-0 text-[11px]">{suffix}</span>}
    </div>
    {subValue && (
      <div className="theme-text-muted mt-1 truncate text-[10px]">{subValue}</div>
    )}
  </div>
);

const MobileBarChart = ({ data, max, isDark, currency }) => {
  if (!data.length) return null;

  return (
    <div className="mt-4" role="img" aria-label={`${data.length} ${data.length === 1 ? 'day' : 'days'} of earnings`}>
      <div className="flex h-24 items-end gap-1.5">
        {data.map((item) => {
          const height = max > 0 ? (item.amount / max) * 100 : 0;
          const empty = item.amount === 0;

          return (
            <div key={item.date} className="flex h-full flex-1 flex-col items-center justify-end">
              <div
                className={`w-full rounded-sm transition-all ${
                  empty
                    ? isDark ? 'bg-white/[0.05]' : 'bg-slate-200'
                    : 'theme-accent-bg'
                }`}
                style={{
                  height: `${Math.max(height, 3)}%`,
                  minHeight: 2,
                  backgroundColor: empty ? undefined : 'var(--accent-primary)'
                }}
                title={empty ? '' : formatCurrency(item.amount, currency)}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {data.map((item) => (
          <div key={item.date} className="theme-text-muted flex-1 text-center text-[9px]">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileExpenseBreakdown = ({ expensesByType, totalExpenses, currency, t, isDark }) => {
  if (Object.keys(expensesByType).length === 0 || totalExpenses <= 0) return null;

  const sortedExpenses = Object.entries(expensesByType).sort(([, a], [, b]) => b - a);
  const categoryColors = [
    'bg-[var(--accent-primary)]',
    'bg-[#a8977c]',
    'bg-[#8aa0b6]',
    'bg-slate-500',
    'bg-slate-400',
    'bg-slate-300'
  ];

  return (
    <div className={`rounded-2xl border p-4 ${
      isDark ? 'border-white/[0.05] bg-slate-800/40' : 'border-slate-200 bg-white'
    }`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="theme-text-primary text-sm font-semibold">
          {t.expenseDetails || t.expenses}
        </span>
        <span className="theme-danger-text shrink-0 text-sm font-bold tabular-nums">
          −{formatCurrency(totalExpenses, currency)}
        </span>
      </div>

      <div className={`mb-3 flex h-2 overflow-hidden rounded-full ${
        isDark ? 'bg-white/[0.05]' : 'bg-slate-100'
      }`}>
        {sortedExpenses.map(([type, amount], index) => (
          <div
            key={type}
            className={categoryColors[index] || 'bg-slate-400'}
            style={{ width: `${(amount / totalExpenses) * 100}%` }}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        {sortedExpenses.map(([type, amount], index) => (
          <div key={type} className="flex items-center gap-3 text-sm">
            <span className={`h-2 w-2 shrink-0 rounded-sm ${
              categoryColors[index] || 'bg-slate-400'
            }`} />
            <span className="theme-text-secondary min-w-0 flex-1 truncate">{t[type] || type}</span>
            <span className="theme-text-muted w-8 text-right text-xs tabular-nums">
              {Math.round((amount / totalExpenses) * 100)}%
            </span>
            <span className="theme-text-primary w-20 text-right text-sm font-semibold tabular-nums">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpenseBreakdown = ({ expensesByType, currency, t, isDark }) => {
  if (Object.keys(expensesByType).length === 0) return null;
  
  const total = Object.values(expensesByType).reduce((sum, val) => sum + val, 0);
  
  return (
    <Card className="p-3.5">
      <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold theme-text-primary">
        <Receipt className="h-4.5 w-4.5 theme-danger-text" />
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
                  <span className="theme-danger-text font-medium">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      background: 'linear-gradient(to right, var(--warm-color), var(--danger-color))'
                    }}
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

  const activeDateRange = useMemo(() => getDateRange(period, customFrom, customTo), [period, customFrom, customTo]);
  
  // Filter shifts based on selected period
  const filteredShifts = useMemo(() => {
    const { startDate, endDate } = activeDateRange;
    return shifts.filter(shift => isDateInRange(shift.date, startDate, endDate));
  }, [shifts, activeDateRange]);
  
  const stats = useMemo(() => {
    return calculateStatistics(filteredShifts, settings);
  }, [filteredShifts, settings]);
  
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

  const mobileTipsCardValue = (() => {
    if (settings.tipsCardPercent > 0 && stats.totalTipsCardGross > 0) {
      return {
        value: formatCurrency(stats.totalTipsCardGross, currency),
        valueSecondLine: `→ ${formatCurrency(stats.totalTipsCard, currency)}`
      };
    }
    return { value: formatCurrency(stats.totalTipsCard, currency) };
  })();

  const activeRangeLabel = useMemo(() => {
    const from = formatDate(activeDateRange.startDate, settings.language);
    const to = formatDate(activeDateRange.endDate, settings.language);
    return from === to ? from : `${from} - ${to}`;
  }, [activeDateRange, settings.language]);

  const mobileChartData = useMemo(() => {
    if (filteredShifts.length === 0 || period === 'today') return [];

    const earningsByDate = new Map();
    filteredShifts.forEach((shift) => {
      const baseEarnings = calculateShiftBaseEarnings(shift, settings);
      earningsByDate.set(shift.date, (earningsByDate.get(shift.date) || 0) + baseEarnings);
    });

    const maxBars = period === 'thisWeek' ? 7 : 14;
    return Array.from(earningsByDate.entries())
      .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
      .slice(-maxBars)
      .map(([date, amount]) => ({
        date,
        amount,
        label: date.slice(8, 10)
      }));
  }, [filteredShifts, period, settings]);

  const mobileChartMax = Math.max(0, ...mobileChartData.map(({ amount }) => amount));

  return (
    <div className="pb-24">
      <div className="lg:hidden">
        <div className="mb-4">
          <h1 className="theme-text-primary text-3xl font-bold tracking-tight">{t.statistics}</h1>
        </div>

        <div className="mb-4 space-y-2">
          <MobilePeriodPill
            options={periodButtons}
            value={period}
            onChange={setPeriod}
            isDark={isDark}
          />

          <div className="flex min-h-7 items-center justify-between gap-3">
            <span className="theme-text-muted min-w-0 truncate text-xs">{activeRangeLabel}</span>
            {filteredShifts.length > 0 && (
              <ExportButton
                shifts={filteredShifts}
                settings={settings}
                t={t}
                isDark={isDark}
                dateFrom={customFrom}
                dateTo={customTo}
                compact
              />
            )}
          </div>

          {period === 'custom' && (
            <div className="mt-2 flex gap-2">
              <input
                type="date"
                aria-label={t.from}
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
                className="theme-bg-input theme-text-primary min-w-0 flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
              <input
                type="date"
                aria-label={t.to}
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
                className="theme-bg-input theme-text-primary min-w-0 flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          )}
        </div>

        {filteredShifts.length === 0 ? (
          <EmptyState icon={BarChart3} title={t.noData} />
        ) : (
          <div className="space-y-4" key={`mobile-${period}-${customFrom}-${customTo}`}>
            <div className={`rounded-2xl border px-4 py-4 ${
              isDark ? 'border-white/[0.05] bg-slate-800/55' : 'border-slate-200 bg-white'
            }`}>
              <MobileSectionLabel>
                {sf.totalEarnings !== false
                  ? `${isHourly ? t.totalEarnings : t.earnedAmount} · ${stats.shiftsCount} ${(t.shiftsCount || '').toLowerCase()}`
                  : `${t.netIncome} · ${stats.shiftsCount} ${(t.shiftsCount || '').toLowerCase()}`}
              </MobileSectionLabel>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="theme-text-primary text-[38px] font-bold leading-none tracking-tight tabular-nums">
                  {formatCurrency(
                    sf.totalEarnings !== false ? stats.totalEarnings : stats.netIncome,
                    currency
                  )}
                </div>
              </div>
              {sf.totalEarnings !== false && (
                <div className="theme-text-muted mt-1.5 text-xs">
                  {t.netIncome}:{' '}
                  <span className="theme-text-secondary font-semibold tabular-nums">
                    {formatCurrency(stats.netIncome, currency)}
                  </span>
                </div>
              )}

              {sf.totalEarnings !== false && mobileChartData.length > 1 && (
                <MobileBarChart
                  data={mobileChartData}
                  max={mobileChartMax}
                  isDark={isDark}
                  currency={currency}
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {sf.totalHours !== false && (
                <MobileMiniStat
                  label={t.totalHours}
                  value={formatTime(stats.totalMinutes)}
                  isDark={isDark}
                />
              )}
              {sf.avgPerHour !== false && (
                <MobileMiniStat
                  label={t.avgPerHour}
                  value={formatCurrency(stats.avgPerHour, currency)}
                  color="theme-warm-text"
                  isDark={isDark}
                />
              )}
              {sf.avgIncomePerShift !== false && (
                <MobileMiniStat
                  label={t.avgIncomePerShift}
                  value={formatCurrency(stats.avgIncomePerShift, currency)}
                  color="theme-warm-text"
                  isDark={isDark}
                />
              )}
            </div>

            {(() => {
              const cells = [];

              if (!isHourly && stats.totalOrders > 0) {
                cells.push(
                  <MobileMiniStat
                    key="orders"
                    label={t.orders}
                    value={stats.totalOrders}
                    color="theme-info-text"
                    isDark={isDark}
                  />
                );
              }
              if (sf.tipsCash !== false && enabledFields.tipsCash && stats.totalTipsCash > 0) {
                cells.push(
                  <MobileMiniStat
                    key="tips-cash"
                    label={t.totalTipsCash}
                    value={formatCurrency(stats.totalTipsCash, currency)}
                    color="theme-income-soft-text"
                    isDark={isDark}
                  />
                );
              }
              if (sf.tipsCard !== false && enabledFields.tipsCard && stats.totalTipsCard > 0) {
                cells.push(
                  <MobileMiniStat
                    key="tips-card"
                    label={t.totalTipsCard}
                    value={mobileTipsCardValue.value}
                    valueSecondLine={mobileTipsCardValue.valueSecondLine}
                    color="theme-info-text"
                    subValue={settings.tipsCardPercent > 0
                      ? `${t.deduction}: ${settings.tipsCardPercent}%`
                      : undefined}
                    isDark={isDark}
                  />
                );
              }
              if (sf.mileage !== false && enabledFields.mileage && stats.totalMileage > 0) {
                cells.push(
                  <MobileMiniStat
                    key="mileage"
                    label={t.totalMileageStats}
                    value={stats.totalMileage}
                    suffix={t.km}
                    isDark={isDark}
                  />
                );
              }
              if (sf.expenses !== false && enabledFields.expenses && stats.totalExpenses > 0) {
                cells.push(
                  <MobileMiniStat
                    key="expenses"
                    label={t.totalExpenses}
                    value={formatCurrency(stats.totalExpenses, currency)}
                    color="theme-danger-text"
                    isDark={isDark}
                  />
                );
              }
              if (enabledFields.bonus && stats.totalBonus > 0) {
                cells.push(
                  <MobileMiniStat
                    key="bonus"
                    label={t.totalBonus}
                    value={formatCurrency(stats.totalBonus, currency)}
                    color="theme-warm-text"
                    isDark={isDark}
                  />
                );
              }
              if (sf.avgHoursPerShift !== false) {
                cells.push(
                  <MobileMiniStat
                    key="average-hours"
                    label={t.avgHoursPerShift}
                    value={formatTime(stats.avgMinutesPerShift)}
                    isDark={isDark}
                  />
                );
              }

              if (cells.length === 0) return null;
              return <div className="grid grid-cols-3 gap-2">{cells}</div>;
            })()}

            {sf.expenseDetails !== false && enabledFields.expenses && stats.totalExpenses > 0 && (
              <MobileExpenseBreakdown
                expensesByType={stats.expensesByType}
                totalExpenses={stats.totalExpenses}
                currency={currency}
                t={t}
                isDark={isDark}
              />
            )}

            {enabledFields.bonus && stats.bonusComments && stats.bonusComments.length > 0 && (
              <CommentsSection
                title={t.bonusComments || 'Комментарии к бонусам'}
                comments={stats.bonusComments}
                icon="gift"
                color="theme-warm-text"
                isDark={isDark}
                t={t}
                currency={currency}
                language={settings.language}
              />
            )}

            {enabledFields.expenses && stats.expenseComments && stats.expenseComments.length > 0 && (
              <CommentsSection
                title={t.expenseComments || 'Комментарии к затратам'}
                comments={stats.expenseComments}
                icon="receipt"
                color="theme-danger-text"
                isDark={isDark}
                t={t}
                currency={currency}
                language={settings.language}
              />
            )}

            <ShiftsList shifts={filteredShifts} settings={settings} t={t} isDark={isDark} />
          </div>
        )}
      </div>

      <div className="hidden lg:block">
      <div className="mb-4">
        <h1 className="text-2xl font-bold theme-text-primary">{t.statistics}</h1>
      </div>
      
      <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-4 lg:items-stretch">
      <Card className="p-3.5 mb-3 lg:mb-0">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <label className="block theme-text-muted text-[11px] uppercase tracking-[0.18em]">{t.selectPeriod}</label>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/[0.04] text-[#c9beaf]' : 'bg-sky-100 text-sky-700'}`}>
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          {periodButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriod(btn.id)}
              className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                period === btn.id
                  ? 'text-[var(--accent-text)]'
                  : isDark 
                    ? 'bg-slate-800/65 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
              style={period === btn.id ? {
                backgroundColor: 'var(--accent-secondary)',
                boxShadow: '0 10px 20px var(--accent-shadow)'
              } : undefined}
            >
              {btn.label}
            </button>
          ))}
        </div>
        
        {period === 'custom' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block theme-text-muted text-xs mb-1">{t.from}</label>
              <input 
                type="date" 
                value={customFrom} 
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full theme-bg-input rounded-xl px-3 py-2 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div className="flex-1">
              <label className="block theme-text-muted text-xs mb-1">{t.to}</label>
              <input 
                type="date" 
                value={customTo} 
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full theme-bg-input rounded-xl px-3 py-2 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>
        )}

        <div className={`mt-3 rounded-lg border px-3 py-2 ${isDark ? 'border-slate-700/50 bg-slate-900/45' : 'border-slate-200 bg-slate-50/90'}`}>
          <div className="min-w-0 theme-text-primary text-sm font-semibold truncate">
            {activeRangeLabel}
          </div>
        </div>
      </Card>
      
      {filteredShifts.length === 0 ? (
        <EmptyState icon={BarChart3} title={t.noData} />
      ) : (
        <div className="space-y-2.5 lg:contents" key={`${period}-${customFrom}-${customTo}`}>
          {/* Net income header */}
          <div className={`rounded-[26px] p-4 border overflow-hidden relative mb-2.5 lg:mb-0 ${
            isDark
              ? 'bg-[#1f2024] border-white/[0.05]'
              : 'bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(235,244,252,0.92))] border-sky-200/80'
          }`}>
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-stone-200/[0.03] blur-2xl" />
            <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl" />
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/[0.04] text-[#d9d0c4]' : 'bg-sky-100 text-sky-700'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">{t.netIncome}</div>
                <span className="theme-text-secondary text-sm">{stats.shiftsCount} {t.shiftsCount}</span>
              </div>
            </div>
            <div className="text-3xl font-bold theme-text-primary mb-2 tracking-tight">
              {formatCurrency(stats.netIncome, currency)}
            </div>
            <div className="theme-text-muted text-sm">
              {stats.shiftsCount} {t.shiftsCount} • {formatTimeLabeled(stats.totalMinutes, t)}
            </div>
          </div>
          
          <div className="space-y-2 lg:col-span-2">
          {/* Stats grid - filtered by settings */}
          <div className="grid auto-rows-fr grid-cols-2 gap-2 xl:grid-cols-4">
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
                color="theme-income-text" 
              />
            )}
            
            {sf.avgPerHour !== false && (
              <StatCard 
                icon={TrendingUp} 
                label={t.avgPerHour} 
                value={formatCurrency(stats.avgPerHour, currency)} 
                color="theme-warm-text" 
              />
            )}
            
            {!isHourly && stats.totalOrders > 0 && (
              <StatCard 
                icon={Package} 
                label={t.orders} 
                value={stats.totalOrders} 
                color="theme-info-text" 
              />
            )}
            
            {sf.tipsCash !== false && enabledFields.tipsCash && stats.totalTipsCash > 0 && (
              <StatCard 
                icon={Banknote} 
                label={t.totalTipsCash} 
                value={formatCurrency(stats.totalTipsCash, currency)} 
                color="theme-income-soft-text" 
              />
            )}
            
            {sf.tipsCard !== false && enabledFields.tipsCard && stats.totalTipsCard > 0 && (
              <StatCard 
                icon={CreditCard} 
                label={t.totalTipsCard} 
                value={formatTipsCardValue()} 
                color="theme-info-text" 
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
                color="theme-danger-text" 
              />
            )}
            
            {enabledFields.bonus && stats.totalBonus > 0 && (
              <StatCard 
                icon={Gift} 
                label={t.totalBonus} 
                value={formatCurrency(stats.totalBonus, currency)} 
                color="theme-warm-text" 
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
                color="theme-warm-text" 
              />
            )}
          </div>
          
          {sf.expenseDetails !== false && enabledFields.expenses && (
            <ExpenseBreakdown expensesByType={stats.expensesByType} currency={currency} t={t} isDark={isDark} />
          )}
          
          {/* Bonus comments */}
          {enabledFields.bonus && stats.bonusComments && stats.bonusComments.length > 0 && (
            <CommentsSection 
              title={t.bonusComments || 'Комментарии к бонусам'} 
              comments={stats.bonusComments} 
              icon="gift"
              color="theme-warm-text"
              isDark={isDark} 
              t={t}
              currency={currency}
              language={settings.language}
            />
          )}
          
          {/* Expense comments */}
          {enabledFields.expenses && stats.expenseComments && stats.expenseComments.length > 0 && (
            <CommentsSection 
              title={t.expenseComments || 'Комментарии к затратам'} 
              comments={stats.expenseComments} 
              icon="receipt"
              color="theme-danger-text"
              isDark={isDark} 
              t={t}
              currency={currency}
              language={settings.language}
            />
          )}
          
          {/* Shifts list for selected period */}
          <ShiftsList shifts={filteredShifts} settings={settings} t={t} isDark={isDark} />
          
          {/* Export button */}
          <ExportButton 
            shifts={filteredShifts} 
            settings={settings} 
            t={t} 
            isDark={isDark}
            dateFrom={customFrom}
            dateTo={customTo}
          />
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

// Export to Excel modal and button
const EXPORT_COLUMNS = [
  { id: 'date', label: 'date', required: true },
  { id: 'hours', label: 'hours' },
  { id: 'earnings', label: 'earnings' },
  { id: 'earnedAmount', label: 'earnedAmount' },
  { id: 'tipsCash', label: 'tipsCash' },
  { id: 'tipsCard', label: 'tipsCard' },
  { id: 'mileage', label: 'mileage' },
  { id: 'expenses', label: 'expenses' },
  { id: 'bonus', label: 'bonus' },
  { id: 'bonusComment', label: 'bonusComment' },
  { id: 'orders', label: 'orders' },
];

const ExportButton = ({ shifts, settings, t, isDark, dateFrom, dateTo, compact = false }) => {
  const [showModal, setShowModal] = useState(false);
  const { enabledFields, workType } = settings;
  const isHourly = workType !== 'pieceWork';
  const [selectedFields, setSelectedFields] = useState(() => (
    isHourly
      ? ['date', 'hours', 'earnings', 'tipsCash', 'tipsCard']
      : ['date', 'hours', 'earnedAmount', 'tipsCash', 'tipsCard']
  ));

  useEffect(() => {
    setSelectedFields(prev => {
      const next = prev.filter(fieldId => fieldId !== 'earnings' && fieldId !== 'earnedAmount');
      return isHourly ? [...next, 'earnings'] : [...next, 'earnedAmount'];
    });
  }, [isHourly]);
  
  // Filter available columns based on settings
  const availableColumns = EXPORT_COLUMNS.filter(col => {
    if (col.id === 'earnings') return isHourly;
    if (col.id === 'earnedAmount') return !isHourly;
    if (col.id === 'tipsCash') return enabledFields?.tipsCash !== false;
    if (col.id === 'tipsCard') return enabledFields?.tipsCard !== false;
    if (col.id === 'mileage') return enabledFields?.mileage !== false;
    if (col.id === 'expenses') return enabledFields?.expenses !== false;
    if (col.id === 'bonus' || col.id === 'bonusComment') return enabledFields?.bonus !== false;
    if (col.id === 'orders' || col.id === 'earnedAmount') return !isHourly;
    return true;
  });
  
  const toggleField = (fieldId) => {
    if (fieldId === 'date') return; // Date is required
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };
  
  const selectAll = () => {
    setSelectedFields(availableColumns.map(c => c.id));
  };
  
  const selectNone = () => {
    setSelectedFields(['date']);
  };
  
  const exportToExcel = async () => {
    if (shifts.length === 0) return;
    
    // Dynamic import of xlsx
    const XLSX = await import('xlsx');
    
    // Prepare data
    const data = shifts
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(shift => {
        const row = {};
        const baseEarnings = calculateShiftBaseEarnings(shift, settings);
        const totalExpenses = shift.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        
        selectedFields.forEach(fieldId => {
          const label = t[fieldId] || fieldId;
          switch (fieldId) {
            case 'date':
              row[label] = shift.date;
              break;
            case 'hours':
              row[label] = shift.totalMinutes ? (shift.totalMinutes / 60).toFixed(2) : 0;
              break;
            case 'earnings':
              row[label] = baseEarnings;
              break;
            case 'earnedAmount':
              row[label] = shift.earnedAmount || 0;
              break;
            case 'tipsCash':
              row[label] = shift.tipsCash || 0;
              break;
            case 'tipsCard':
              row[label] = shift.tipsCard || 0;
              break;
            case 'mileage':
              row[label] = shift.mileage || 0;
              break;
            case 'expenses':
              row[label] = totalExpenses;
              break;
            case 'bonus':
              row[label] = shift.bonus || 0;
              break;
            case 'bonusComment':
              row[label] = shift.bonusComment || '';
              break;
            case 'orders':
              row[label] = shift.ordersCount || 0;
              break;
          }
        });
        return row;
      });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Auto-width columns
    const colWidths = selectedFields.map(fieldId => {
      const label = t[fieldId] || fieldId;
      return { wch: Math.max(label.length + 2, 12) };
    });
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Shifts');
    
    // Generate filename
    const fromStr = dateFrom || 'start';
    const toStr = dateTo || 'end';
    const filename = `shifts_${fromStr}_${toStr}.xlsx`;
    
    // Download
    XLSX.writeFile(wb, filename);
    setShowModal(false);
  };
  
  if (shifts.length === 0) return null;
  
  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="theme-text-secondary hover:theme-text-primary flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-1 text-xs font-medium transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          {t.exportToExcel || 'Выгрузить в Excel'}
        </button>
      ) : (
        <Card className="p-3.5">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[var(--accent-text)] font-semibold transition-all"
            style={{ backgroundColor: 'var(--accent-secondary)', boxShadow: '0 14px 26px var(--accent-shadow)' }}
          >
            <Download className="w-5 h-5" />
            {t.exportToExcel || 'Выгрузить в Excel'}
          </button>
        </Card>
      )}
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[26px] p-5 border ${isDark ? 'bg-slate-900/95 border-slate-700/60' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="theme-text-primary font-semibold text-base flex items-center gap-2">
          <FileSpreadsheet className="w-4.5 h-4.5 theme-income-text" />
                {t.exportToExcel || 'Выгрузить в Excel'}
              </h3>
              <button onClick={() => setShowModal(false)} className="theme-text-muted hover:theme-text-primary">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <p className="theme-text-muted text-sm mb-4">
              {t.selectFieldsToExport || 'Выберите поля для выгрузки'}
            </p>
            
            {/* Quick actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={selectAll}
                    className="text-xs px-3 py-1.5 rounded-xl hover:brightness-105"
                    style={{ backgroundColor: 'var(--selection-surface)', color: 'var(--selection-text)' }}
              >
                {t.selectAll || 'Выбрать все'}
              </button>
              <button
                onClick={selectNone}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
              >
                {t.clearSelection || 'Очистить'}
              </button>
            </div>
            
            {/* Field selection */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto mb-6">
              {availableColumns.map(col => {
                const isSelected = selectedFields.includes(col.id);
                const isRequired = col.required;
                return (
                  <button
                    key={col.id}
                    onClick={() => toggleField(col.id)}
                    disabled={isRequired}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors ${
                      isSelected
                    ? 'bg-[var(--selection-surface)] text-[var(--selection-text)] border border-[var(--selection-border)]'
                        : isDark 
                          ? 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    } ${isRequired ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span>{t[col.label] || col.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
            
            {/* Export button */}
            <button
              onClick={exportToExcel}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[var(--accent-text)] font-semibold transition-all"
                style={{ backgroundColor: 'var(--accent-secondary)', boxShadow: '0 14px 26px var(--accent-shadow)' }}
            >
              <Download className="w-5 h-5" />
              {t.export || 'Выгрузить'} ({shifts.length} {t.shiftsCount || 'смен'})
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Comments section (for bonus and expenses)
const CommentsSection = ({ title, comments, icon, color, isDark, currency, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const IconComponent = icon === 'gift' ? Gift : Receipt;
  
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4.5 h-4.5 ${color}`} />
          <span className="theme-text-primary text-sm font-semibold">{title}</span>
          <span className="theme-text-muted text-sm">({comments.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4.5 h-4.5 theme-text-muted" />
        ) : (
          <ChevronDown className="w-4.5 h-4.5 theme-text-muted" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-slate-700/30 px-4 py-2">
          {comments.map((item, idx) => (
            <div 
              key={idx}
              className={`py-2 flex justify-between items-start border-b last:border-b-0 ${
                isDark ? 'border-slate-700/30' : 'border-slate-200'
              }`}
            >
              <div className="flex-1">
                <div className="theme-text-muted text-xs">{formatDate(item.date, language || 'ru')}</div>
                <div className="theme-text-secondary text-sm">{item.comment}</div>
              </div>
              <span className={`${color} font-medium text-sm ml-2`}>
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Available columns for shifts list
const SHIFT_COLUMNS = [
  { id: 'hours', label: 'hours', icon: Clock },
  { id: 'earnings', label: 'earnings', icon: DollarSign },
  { id: 'earnedAmount', label: 'earnedAmount', icon: DollarSign },
  { id: 'tipsCash', label: 'tipsCash', icon: Banknote },
  { id: 'tipsCard', label: 'tipsCard', icon: CreditCard },
  { id: 'mileage', label: 'mileage', icon: Car },
  { id: 'expenses', label: 'expenses', icon: Receipt },
  { id: 'bonus', label: 'bonus', icon: Gift },
  { id: 'orders', label: 'orders', icon: Package },
];

// Collapsible shifts list with column selector
const ShiftsList = ({ shifts, settings, t, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const { currency, enabledFields, workType } = settings;
  const isHourly = workType !== 'pieceWork';
  const [selectedColumns, setSelectedColumns] = useState(() => (
    isHourly ? ['hours', 'earnings'] : ['hours', 'earnedAmount']
  ));

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSelectedColumns(prev => {
      const next = prev.filter(colId => colId !== 'earnings' && colId !== 'earnedAmount');
      return isHourly ? [...next, 'earnings'] : [...next, 'earnedAmount'];
    });
  }, [isHourly]);
  /* eslint-enable react-hooks/set-state-in-effect */
  
  if (shifts.length === 0) return null;
  
  // Filter available columns based on enabled fields
  const availableColumns = SHIFT_COLUMNS.filter(col => {
    if (col.id === 'earnings') return isHourly;
    if (col.id === 'earnedAmount') return !isHourly;
    if (col.id === 'tipsCash') return enabledFields?.tipsCash !== false;
    if (col.id === 'tipsCard') return enabledFields?.tipsCard !== false;
    if (col.id === 'mileage') return enabledFields?.mileage !== false;
    if (col.id === 'expenses') return enabledFields?.expenses !== false;
    if (col.id === 'bonus') return enabledFields?.bonus !== false;
    if (col.id === 'orders') return !isHourly;
    return true;
  });
  
  // Sort by date descending
  const sortedShifts = [...shifts].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const toggleColumn = (colId) => {
    setSelectedColumns(prev => 
      prev.includes(colId) 
        ? prev.filter(c => c !== colId)
        : [...prev, colId]
    );
  };
  
  const getColumnValue = (shift, colId) => {
    const baseEarnings = calculateShiftBaseEarnings(shift, settings);
    const totalExpenses = shift.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    
    switch (colId) {
      case 'hours': return formatTime(shift.totalMinutes);
      case 'earnings': return formatCurrency(baseEarnings, currency);
      case 'earnedAmount': return formatCurrency(shift.earnedAmount || 0, currency);
      case 'tipsCash': return shift.tipsCash ? formatCurrency(shift.tipsCash, currency) : '-';
      case 'tipsCard': return shift.tipsCard ? formatCurrency(shift.tipsCard, currency) : '-';
      case 'mileage': return shift.mileage ? `${shift.mileage} ${t.km || 'км'}` : '-';
      case 'expenses': return totalExpenses > 0 ? formatCurrency(totalExpenses, currency) : '-';
      case 'bonus': return shift.bonus ? formatCurrency(shift.bonus, currency) : '-';
      case 'orders': return shift.ordersCount || '-';
      default: return '-';
    }
  };
  
  const getColumnColor = (colId) => {
    switch (colId) {
      case 'earnings': return 'theme-income-text';
      case 'earnedAmount': return 'theme-info-text';
      case 'tipsCash': return 'theme-income-soft-text';
      case 'tipsCard': return 'theme-info-text';
      case 'expenses': return 'theme-danger-text';
      case 'bonus': return 'theme-warm-text';
      default: return 'theme-text-secondary';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <List className="w-4.5 h-4.5 theme-info-text" />
          <span className="theme-text-primary font-semibold">
            {t.showShiftsList || 'Список смен'}
          </span>
          <span className="theme-text-muted text-sm">({shifts.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4.5 h-4.5 theme-text-muted" />
        ) : (
          <ChevronDown className="w-4.5 h-4.5 theme-text-muted" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-slate-700/30">
          {/* Column selector toggle */}
          <div className={`px-4 py-2 border-b ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center gap-2 text-sm theme-text-secondary hover:theme-text-primary"
            >
              <Settings className="w-4 h-4" />
              {t.selectColumns || 'Выбрать колонки'}
              {showColumnSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showColumnSelector && (
              <div className="flex flex-wrap gap-2 mt-3">
                {availableColumns.map(col => {
                  const Icon = col.icon;
                  const isSelected = selectedColumns.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                        ? 'bg-[var(--selection-surface)] text-[var(--selection-text)] border border-[var(--selection-border)]'
                          : isDark 
                            ? 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t[col.label] || col.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Scrollable table container */}
          <div className="overflow-x-auto">
            {/* Header row */}
            <div className={`flex text-xs font-medium theme-text-muted border-b sticky top-0 ${
              isDark ? 'border-slate-700/30 bg-[#0f172a]' : 'border-slate-200 bg-white'
            }`}>
              <div className={`flex-shrink-0 w-[100px] px-4 py-2 sticky left-0 z-10 ${
                isDark ? 'bg-[#0f172a]' : 'bg-white'
              }`} style={{ boxShadow: '4px 0 8px rgba(0,0,0,0.3)' }}>
                {t.date || 'Дата'}
              </div>
              {selectedColumns.map(colId => {
                const col = SHIFT_COLUMNS.find(c => c.id === colId);
                return (
                  <span key={colId} className="min-w-[80px] px-3 py-2 text-right flex-shrink-0">
                    {t[col?.label] || col?.label}
                  </span>
                );
              })}
            </div>
            
            {/* Data rows */}
            {sortedShifts.map((shift) => (
              <div 
                key={shift.id}
                className={`flex border-b last:border-b-0 ${
                  isDark ? 'border-slate-700/30' : 'border-slate-200'
                }`}
              >
                <div className={`flex-shrink-0 w-[100px] px-4 py-3 theme-text-secondary text-sm sticky left-0 z-10 ${
                  isDark ? 'bg-[#0f172a]' : 'bg-white'
                }`} style={{ boxShadow: '4px 0 8px rgba(0,0,0,0.3)' }}>
                  {formatDate(shift.date, settings.language)}
                </div>
                {selectedColumns.map(colId => (
                  <span 
                    key={colId} 
                    className={`text-sm font-medium min-w-[80px] px-3 py-3 text-right flex-shrink-0 ${getColumnColor(colId)}`}
                  >
                    {getColumnValue(shift, colId)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatisticsScreen;
