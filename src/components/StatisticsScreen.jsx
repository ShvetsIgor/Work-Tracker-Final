import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock, DollarSign, Banknote, CreditCard, Car, Receipt, Gift,
  TrendingUp, BarChart3, Package, ChevronDown, ChevronUp, List, Settings,
  Download, FileSpreadsheet, X, Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { EmptyState } from '@/components/ui';
import { getDateRange, isDateInRange, formatDate } from '@/utils/dateUtils';
import { calculateStatistics, calculateShiftBaseEarnings } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';

const SectionLabel = ({ children, className = '' }) => (
  <div className={`theme-text-muted text-[11px] uppercase tracking-[0.14em] font-semibold ${className}`}>
    {children}
  </div>
);

const PeriodPill = ({ options, value, onChange, isDark }) => (
  <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-900/50 border border-white/[0.04]' : 'bg-slate-100 border border-slate-200'}`}>
    {options.map(opt => {
      const active = value === opt.id;
      return (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex-1 rounded-lg px-2 py-2 text-[12px] font-semibold transition-all ${
            active
              ? isDark
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white text-slate-900 shadow-sm'
              : 'theme-text-muted hover:theme-text-secondary'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const MiniStat = ({ label, value, suffix, color = 'theme-text-primary', isDark }) => (
  <div className={`rounded-xl border p-3 ${isDark ? 'border-white/[0.05] bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
    <div className="mb-1 theme-text-muted text-[11px]">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className={`text-base font-bold tabular-nums ${color}`}>{value}</span>
      {suffix && <span className="theme-text-muted text-[11px]">{suffix}</span>}
    </div>
  </div>
);

const BarChart = ({ data, max, isDark, currency }) => {
  if (!data.length) return null;
  return (
    <div className="mt-4">
      <div className="flex items-end gap-1.5 h-24">
        {data.map((d, i) => {
          const h = max > 0 ? (d.amount / max) * 100 : 0;
          const empty = d.amount === 0;
          return (
            <div key={i} className="flex flex-col items-center justify-end flex-1 h-full">
              <div
                className={`w-full rounded-sm transition-all ${
                  empty
                    ? isDark ? 'bg-white/[0.05]' : 'bg-slate-200'
                    : 'theme-accent-bg'
                }`}
                style={{ height: `${Math.max(h, 3)}%`, minHeight: 2, backgroundColor: empty ? undefined : 'var(--accent-primary)' }}
                title={empty ? '' : formatCurrency(d.amount, currency)}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center theme-text-muted text-[9px]">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpenseBreakdown = ({ expensesByType, totalExpenses, currency, t, isDark }) => {
  if (Object.keys(expensesByType).length === 0) return null;

  const sorted = Object.entries(expensesByType).sort(([, a], [, b]) => b - a);
  const categoryColors = ['bg-[var(--accent-primary)]', 'bg-[#a8977c]', 'bg-[#8aa0b6]', 'bg-slate-500', 'bg-slate-400', 'bg-slate-300'];

  return (
    <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/[0.05] bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="theme-text-primary text-sm font-semibold">{t.expenseDetails || t.expenses}</span>
        <span className="theme-danger-text text-sm font-bold tabular-nums">
          −{formatCurrency(totalExpenses, currency)}
        </span>
      </div>

      <div className={`mb-3 flex h-2 overflow-hidden rounded-full ${isDark ? 'bg-white/[0.05]' : 'bg-slate-100'}`}>
        {sorted.map(([type, amount], i) => {
          const pct = (amount / totalExpenses) * 100;
          return (
            <div
              key={type}
              className={categoryColors[i] || 'bg-slate-400'}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>

      <div className="space-y-1.5">
        {sorted.map(([type, amount], i) => {
          const pct = Math.round((amount / totalExpenses) * 100);
          return (
            <div key={type} className="flex items-center gap-3 text-sm">
              <span className={`h-2 w-2 shrink-0 rounded-sm ${categoryColors[i] || 'bg-slate-400'}`} />
              <span className="theme-text-secondary flex-1 truncate">{t[type] || type}</span>
              <span className="theme-text-muted text-xs tabular-nums w-8 text-right">{pct}%</span>
              <span className="theme-text-primary text-sm font-semibold tabular-nums w-20 text-right">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatisticsScreen = () => {
  const { t, shifts, settings } = useApp();
  const { enabledFields, currency, statisticsFields } = settings;
  const sf = statisticsFields || {};
  const isHourly = settings.workType !== 'pieceWork';
  const isDark = settings.theme !== 'light';

  const getPrevMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const firstDay = new Date(prevYear, prevMonth, 1);
    const lastDay = new Date(prevYear, prevMonth + 1, 0);
    const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { from: toIso(firstDay), to: toIso(lastDay) };
  };

  const prevMonth = getPrevMonthDates();
  const [period, setPeriod] = useState('thisMonth');
  const [customFrom, setCustomFrom] = useState(prevMonth.from);
  const [customTo, setCustomTo] = useState(prevMonth.to);

  const activeDateRange = useMemo(() => getDateRange(period, customFrom, customTo), [period, customFrom, customTo]);

  const filteredShifts = useMemo(() => {
    const { startDate, endDate } = activeDateRange;
    return shifts.filter(shift => isDateInRange(shift.date, startDate, endDate));
  }, [shifts, activeDateRange]);

  const stats = useMemo(() => calculateStatistics(filteredShifts, settings), [filteredShifts, settings]);

  const periodOptions = [
    { id: 'today', label: t.today },
    { id: 'thisWeek', label: t.thisWeek },
    { id: 'thisMonth', label: t.thisMonth },
    { id: 'custom', label: t.custom }
  ];

  const activeRangeLabel = useMemo(() => {
    const from = formatDate(activeDateRange.startDate, settings.language);
    const to = formatDate(activeDateRange.endDate, settings.language);
    return from === to ? from : `${from} — ${to}`;
  }, [activeDateRange, settings.language]);

  const formatTipsCardValue = () => {
    if (settings.tipsCardPercent > 0 && stats.totalTipsCardGross > 0) {
      return `${formatCurrency(stats.totalTipsCardGross, currency)} → ${formatCurrency(stats.totalTipsCard, currency)}`;
    }
    return formatCurrency(stats.totalTipsCard, currency);
  };

  // Bar chart data: aggregate earnings per day for thisWeek, thisMonth, custom
  const chartData = useMemo(() => {
    if (filteredShifts.length === 0 || period === 'today') return [];

    const byDate = new Map();
    filteredShifts.forEach(shift => {
      const base = calculateShiftBaseEarnings(shift, settings);
      const net = base + (shift.tipsCash || 0) + (shift.tipsCard || 0) + (shift.bonus || 0);
      byDate.set(shift.date, (byDate.get(shift.date) || 0) + net);
    });

    const entries = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    // For thisWeek: show 7 days; for thisMonth: show up to N days
    const maxBars = period === 'thisWeek' ? 7 : 14;
    const slice = entries.slice(-maxBars);

    return slice.map(([date, amount]) => ({
      amount,
      label: date.slice(8, 10),
    }));
  }, [filteredShifts, period, settings]);

  const chartMax = Math.max(0, ...chartData.map(d => d.amount));

  return (
    <div className="pb-24">
      <div className="mb-4">
        <h1 className="text-3xl font-bold theme-text-primary tracking-tight">{t.statistics}</h1>
      </div>

      {/* Period picker */}
      <div className="mb-4 space-y-2">
        <PeriodPill options={periodOptions} value={period} onChange={setPeriod} isDark={isDark} />
        <div className="flex items-center justify-between">
          <span className="theme-text-muted text-xs">{activeRangeLabel}</span>
          {filteredShifts.length > 0 && (
            <ExportButton
              shifts={filteredShifts}
              settings={settings}
              t={t}
              isDark={isDark}
              dateFrom={customFrom}
              dateTo={customTo}
            />
          )}
        </div>
        {period === 'custom' && (
          <div className="mt-2 flex gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="flex-1 theme-bg-input rounded-xl px-3 py-2 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="flex-1 theme-bg-input rounded-xl px-3 py-2 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>
        )}
      </div>

      {filteredShifts.length === 0 ? (
        <EmptyState icon={BarChart3} title={t.noData} />
      ) : (
        <div key={`${period}-${customFrom}-${customTo}`} className="space-y-4">
          {/* Headline */}
          <div className={`rounded-2xl border px-4 py-4 ${isDark ? 'border-white/[0.05] bg-slate-800/55' : 'border-slate-200 bg-white'}`}>
            <SectionLabel>
              {isHourly ? t.totalEarnings : t.earnedAmount} · {stats.shiftsCount} {(t.shiftsCount || '').toLowerCase()}
            </SectionLabel>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="theme-text-primary font-display text-[42px] leading-none tabular-nums">
                {formatCurrency(stats.totalEarnings, currency)}
              </div>
            </div>
            <div className="mt-1.5 theme-text-muted text-xs">
              {t.netIncome}: <span className="theme-text-secondary font-semibold tabular-nums">{formatCurrency(stats.netIncome, currency)}</span>
            </div>

            {chartData.length > 1 && (
              <BarChart data={chartData} max={chartMax} isDark={isDark} currency={currency} />
            )}
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-2">
            {sf.totalHours !== false && (
              <MiniStat label={t.totalHours} value={formatTime(stats.totalMinutes)} isDark={isDark} />
            )}
            {sf.avgPerHour !== false && (
              <MiniStat label={t.avgPerHour} value={formatCurrency(stats.avgPerHour, currency)} isDark={isDark} color="theme-warm-text" />
            )}
            {sf.avgIncomePerShift !== false && (
              <MiniStat label={t.avgIncomePerShift} value={formatCurrency(stats.avgIncomePerShift, currency)} isDark={isDark} color="theme-warm-text" />
            )}
          </div>

          {/* Secondary stats: tips, mileage, bonus, orders */}
          {(() => {
            const cells = [];
            if (!isHourly && stats.totalOrders > 0) {
              cells.push(<MiniStat key="orders" label={t.orders} value={stats.totalOrders} color="theme-info-text" isDark={isDark} />);
            }
            if (sf.tipsCash !== false && enabledFields.tipsCash && stats.totalTipsCash > 0) {
              cells.push(<MiniStat key="tc" label={t.totalTipsCash} value={formatCurrency(stats.totalTipsCash, currency)} color="theme-income-soft-text" isDark={isDark} />);
            }
            if (sf.tipsCard !== false && enabledFields.tipsCard && stats.totalTipsCard > 0) {
              cells.push(<MiniStat key="tcd" label={t.totalTipsCard} value={formatTipsCardValue()} color="theme-info-text" isDark={isDark} />);
            }
            if (sf.mileage !== false && enabledFields.mileage && stats.totalMileage > 0) {
              cells.push(<MiniStat key="km" label={t.totalMileageStats} value={stats.totalMileage} suffix={t.km} isDark={isDark} />);
            }
            if (enabledFields.bonus && stats.totalBonus > 0) {
              cells.push(<MiniStat key="bonus" label={t.totalBonus} value={formatCurrency(stats.totalBonus, currency)} color="theme-warm-text" isDark={isDark} />);
            }
            if (sf.avgHoursPerShift !== false) {
              cells.push(<MiniStat key="avgh" label={t.avgHoursPerShift} value={formatTime(stats.avgMinutesPerShift)} isDark={isDark} />);
            }
            if (cells.length === 0) return null;
            return (
              <div className="grid grid-cols-3 gap-2">{cells}</div>
            );
          })()}

          {/* Expense breakdown */}
          {sf.expenseDetails !== false && enabledFields.expenses && stats.totalExpenses > 0 && (
            <ExpenseBreakdown
              expensesByType={stats.expensesByType}
              totalExpenses={stats.totalExpenses}
              currency={currency}
              t={t}
              isDark={isDark}
            />
          )}

          {/* Bonus comments */}
          {enabledFields.bonus && stats.bonusComments && stats.bonusComments.length > 0 && (
            <CommentsSection
              title={t.bonusComments || 'Комментарии к бонусам'}
              comments={stats.bonusComments}
              icon={Gift}
              color="theme-warm-text"
              isDark={isDark}
              currency={currency}
              language={settings.language}
            />
          )}

          {/* Expense comments */}
          {enabledFields.expenses && stats.expenseComments && stats.expenseComments.length > 0 && (
            <CommentsSection
              title={t.expenseComments || 'Комментарии к затратам'}
              comments={stats.expenseComments}
              icon={Receipt}
              color="theme-danger-text"
              isDark={isDark}
              currency={currency}
              language={settings.language}
            />
          )}

          {/* Shifts list */}
          <ShiftsList shifts={filteredShifts} settings={settings} t={t} isDark={isDark} />
        </div>
      )}
    </div>
  );
};

// --- Export button (unchanged logic, light restyle) ---

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

const ExportButton = ({ shifts, settings, t, isDark, dateFrom, dateTo }) => {
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
    if (fieldId === 'date') return;
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const selectAll = () => setSelectedFields(availableColumns.map(c => c.id));
  const selectNone = () => setSelectedFields(['date']);

  const exportToExcel = async () => {
    if (shifts.length === 0) return;
    const XLSX = await import('xlsx');

    const data = shifts
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(shift => {
        const row = {};
        const baseEarnings = calculateShiftBaseEarnings(shift, settings);
        const totalExpenses = shift.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        selectedFields.forEach(fieldId => {
          const label = t[fieldId] || fieldId;
          switch (fieldId) {
            case 'date': row[label] = shift.date; break;
            case 'hours': row[label] = shift.totalMinutes ? (shift.totalMinutes / 60).toFixed(2) : 0; break;
            case 'earnings': row[label] = baseEarnings; break;
            case 'earnedAmount': row[label] = shift.earnedAmount || 0; break;
            case 'tipsCash': row[label] = shift.tipsCash || 0; break;
            case 'tipsCard': row[label] = shift.tipsCard || 0; break;
            case 'mileage': row[label] = shift.mileage || 0; break;
            case 'expenses': row[label] = totalExpenses; break;
            case 'bonus': row[label] = shift.bonus || 0; break;
            case 'bonusComment': row[label] = shift.bonusComment || ''; break;
            case 'orders': row[label] = shift.ordersCount || 0; break;
            default: break;
          }
        });
        return row;
      });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = selectedFields.map(fieldId => {
      const label = t[fieldId] || fieldId;
      return { wch: Math.max(label.length + 2, 12) };
    });
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, 'Shifts');

    const filename = `shifts_${dateFrom || 'start'}_${dateTo || 'end'}.xlsx`;
    XLSX.writeFile(wb, filename);
    setShowModal(false);
  };

  if (shifts.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 theme-text-secondary hover:theme-text-primary text-xs font-medium"
      >
        <Download className="h-3.5 w-3.5" />
        {t.exportToExcel || 'Excel'}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-5 border ${isDark ? 'bg-slate-900 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="theme-text-primary font-semibold text-base flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 theme-income-text" />
                {t.exportToExcel || 'Выгрузить в Excel'}
              </h3>
              <button onClick={() => setShowModal(false)} className="theme-text-muted hover:theme-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="theme-text-muted text-sm mb-4">
              {t.selectFieldsToExport || 'Выберите поля для выгрузки'}
            </p>

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
                className={`text-xs px-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t.clearSelection || 'Очистить'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto mb-5">
              {availableColumns.map(col => {
                const isSelected = selectedFields.includes(col.id);
                const isRequired = col.required;
                return (
                  <button
                    key={col.id}
                    onClick={() => toggleField(col.id)}
                    disabled={isRequired}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      isSelected
                        ? 'bg-[var(--selection-surface)] text-[var(--selection-text)]'
                        : isDark
                          ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    } ${isRequired ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span>{t[col.label] || col.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={exportToExcel}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[var(--accent-text)] font-semibold transition-all"
              style={{ backgroundColor: 'var(--accent-secondary)', boxShadow: '0 14px 26px var(--accent-shadow)' }}
            >
              <Download className="w-4 h-4" />
              {t.export || 'Выгрузить'} ({shifts.length})
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// --- Comments section ---

const CommentsSection = ({ title, comments, icon: Icon, color, isDark, currency, language }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-white/[0.05] bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="theme-text-primary text-sm font-semibold">{title}</span>
          <span className="theme-text-muted text-sm">({comments.length})</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 theme-text-muted" /> : <ChevronDown className="w-4 h-4 theme-text-muted" />}
      </button>

      {isOpen && (
        <div className={`border-t px-4 py-2 ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
          {comments.map((item, idx) => (
            <div
              key={idx}
              className={`py-2 flex justify-between items-start border-b last:border-b-0 ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="theme-text-muted text-xs">{formatDate(item.date, language || 'ru')}</div>
                <div className="theme-text-secondary text-sm">{item.comment}</div>
              </div>
              <span className={`${color} font-medium text-sm ml-2 tabular-nums`}>
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Shifts list table (kept, restyled) ---

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

const ShiftsList = ({ shifts, settings, t, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const { currency, enabledFields, workType } = settings;
  const isHourly = workType !== 'pieceWork';
  const [selectedColumns, setSelectedColumns] = useState(() => (
    isHourly ? ['hours', 'earnings'] : ['hours', 'earnedAmount']
  ));

  useEffect(() => {
    setSelectedColumns(prev => {
      const next = prev.filter(colId => colId !== 'earnings' && colId !== 'earnedAmount');
      return isHourly ? [...next, 'earnings'] : [...next, 'earnedAmount'];
    });
  }, [isHourly]);

  if (shifts.length === 0) return null;

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
      case 'tipsCash': return shift.tipsCash ? formatCurrency(shift.tipsCash, currency) : '−';
      case 'tipsCard': return shift.tipsCard ? formatCurrency(shift.tipsCard, currency) : '−';
      case 'mileage': return shift.mileage ? `${shift.mileage} ${t.km || 'км'}` : '−';
      case 'expenses': return totalExpenses > 0 ? formatCurrency(totalExpenses, currency) : '−';
      case 'bonus': return shift.bonus ? formatCurrency(shift.bonus, currency) : '−';
      case 'orders': return shift.ordersCount || '−';
      default: return '−';
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

  const stickyBg = isDark ? 'bg-slate-900' : 'bg-white';

  return (
    <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-white/[0.05] bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 theme-info-text" />
          <span className="theme-text-primary font-semibold text-sm">
            {t.showShiftsList || 'Список смен'}
          </span>
          <span className="theme-text-muted text-sm">({shifts.length})</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 theme-text-muted" /> : <ChevronDown className="w-4 h-4 theme-text-muted" />}
      </button>

      {isOpen && (
        <div className={`border-t ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
          <div className={`px-4 py-2 border-b ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
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
                          ? 'bg-[var(--selection-surface)] text-[var(--selection-text)]'
                          : isDark
                            ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {t[col.label] || col.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className={`flex text-xs font-medium theme-text-muted border-b sticky top-0 ${
              isDark ? 'border-white/[0.05]' : 'border-slate-200'
            } ${stickyBg}`}>
              <div className={`flex-shrink-0 w-[100px] px-4 py-2 sticky left-0 z-10 ${stickyBg}`}>
                {t.date || 'Дата'}
              </div>
              {selectedColumns.map(colId => {
                const col = SHIFT_COLUMNS.find(c => c.id === colId);
                return (
                  <span key={colId} className="min-w-[80px] px-3 py-2 text-right flex-shrink-0 uppercase tracking-wide">
                    {t[col?.label] || col?.label}
                  </span>
                );
              })}
            </div>

            {sortedShifts.map((shift) => (
              <div
                key={shift.id}
                className={`flex border-b last:border-b-0 ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}
              >
                <div className={`flex-shrink-0 w-[100px] px-4 py-3 theme-text-secondary text-sm sticky left-0 z-10 ${stickyBg}`}>
                  {formatDate(shift.date, settings.language)}
                </div>
                {selectedColumns.map(colId => (
                  <span
                    key={colId}
                    className={`text-sm font-medium min-w-[80px] px-3 py-3 text-right flex-shrink-0 tabular-nums ${getColumnColor(colId)}`}
                  >
                    {getColumnValue(shift, colId)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsScreen;
