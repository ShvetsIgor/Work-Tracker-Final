import React, { lazy, Suspense, useState, useMemo, memo } from 'react';
import { Plus, Clock, Car, Banknote, CreditCard, Gift, Receipt, Trash2, Edit3, ClipboardList, Package, DollarSign, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { parseISO, startOfWeek, endOfWeek, format } from 'date-fns';
import { ru, enUS, he } from 'date-fns/locale';
import { useApp } from '@/context/AppContext';
import { Button, Card, EmptyState } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { formatDate, isToday, isYesterday } from '@/utils/dateUtils';
import { calculateShiftBaseEarnings, calculateNetTipsCard, calculateTotalExpenses, calculateShiftNetIncome, calculateStatistics } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';

const ShiftModal = lazy(() => import('@/components/ShiftModal'));

const locales = { ru, en: enUS, he };
const weekLabels = { ru: 'Неделя', en: 'Week', he: 'שבוע' };
const shiftCountLabels = { ru: 'смен', en: 'shifts', he: 'משמרות' };
const parseShiftDate = (date) => (
  typeof date === 'string' ? parseISO(date) : new Date(date)
);

const groupShiftsByWeek = (shifts, language = 'ru') => {
  const locale = locales[language] || ru;
  const buckets = new Map();

  shifts.forEach((shift) => {
    const date = parseShiftDate(shift.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');

    if (!buckets.has(key)) {
      buckets.set(key, { weekStart, shifts: [] });
    }
    buckets.get(key).shifts.push(shift);
  });

  return Array.from(buckets.values())
    .sort((a, b) => b.weekStart - a.weekStart)
    .map(({ weekStart, shifts: weekShifts }) => ({
      weekStart,
      label: `${format(weekStart, 'd MMM', { locale })} – ${format(
        endOfWeek(weekStart, { weekStartsOn: 1 }),
        'd MMM',
        { locale }
      )}`,
      shifts: weekShifts
    }));
};

// Compact shift row
const ShiftRow = memo(({ shift, onExpand, isExpanded, settings, t, isLast = false }) => {
  const baseEarnings = calculateShiftBaseEarnings(shift, settings);
  const isDark = settings.theme !== 'light';
  const isHourly = settings.workType !== 'pieceWork';
  const netTipsCard = calculateNetTipsCard(shift.tipsCard, settings.tipsCardPercent);
  const totalExpenses = calculateTotalExpenses(shift.expenses);
  const grossEarnings = baseEarnings + (shift.tipsCash || 0) + netTipsCard + (shift.bonus || 0);
  const shiftDate = parseShiftDate(shift.date);
  const dayNumber = shiftDate.getDate();
  const dayOfWeek = format(shiftDate, 'EEEEEE', {
    locale: locales[settings.language] || ru
  }).toLowerCase();
  const durationLabel = formatTime(shift.totalMinutes);
  const tipsTotal = (shift.tipsCash || 0) + netTipsCard;
  
  const getDateLabel = () => {
    if (isToday(shift.date)) return t.today;
    if (isYesterday(shift.date)) return t.yesterday;
    return formatDate(shift.date, settings.language);
  };
  
  return (
    <>
      <button
        type="button"
        onClick={onExpand}
        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors lg:hidden ${
          !isLast ? (isDark ? 'border-b border-white/[0.04]' : 'border-b border-slate-200/70') : ''
        } ${
          isExpanded
            ? (isDark ? 'bg-white/[0.03]' : 'bg-slate-50')
            : (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/70')
        }`}
      >
        <div className="flex w-10 shrink-0 flex-col items-center leading-none">
          <div className="theme-text-primary text-lg font-bold tabular-nums">
            {dayNumber}
          </div>
          <div className="theme-text-muted mt-1 text-[10px] uppercase tracking-wide">
            {dayOfWeek}
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-[40px_minmax(0,1fr)_48px_64px] items-baseline gap-y-1">
          <div className="col-span-3 row-start-1 flex min-w-0 items-baseline gap-1.5 text-sm font-medium theme-text-primary">
            {shift.timeMode === 'range' && shift.startTime && shift.endTime ? (
              <>
                <span className="tabular-nums">{shift.startTime}</span>
                <span className="theme-text-muted text-xs">—</span>
                <span className="tabular-nums">{shift.endTime}</span>
              </>
            ) : (
              <span className="tabular-nums">{formatTime(shift.totalMinutes)}</span>
            )}
            {isToday(shift.date) && (
              <span className="ml-1 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                {t.today}
              </span>
            )}
          </div>
          <div className="col-start-4 row-start-1 text-right text-sm font-bold tabular-nums theme-text-primary">
            {formatCurrency(grossEarnings, settings.currency)}
          </div>

          <div className="col-start-1 row-start-2 text-[11px] theme-text-muted">
            <span className="font-medium tabular-nums">{durationLabel}</span>
          </div>

          {tipsTotal > 0 && (
            <div className="col-start-2 row-start-2 min-w-0 truncate px-1 text-[11px] theme-text-muted">
              {(t.tips || 'tips').toLowerCase()}{' '}
              <span className="font-medium tabular-nums">
                {formatCurrency(tipsTotal, settings.currency)}
              </span>
            </div>
          )}

          {shift.mileage > 0 && (
            <div className="col-start-3 row-start-2 whitespace-nowrap text-center text-[11px] theme-text-muted">
              <span className="font-medium tabular-nums">{shift.mileage}</span> {t.km || 'km'}
            </div>
          )}

          {totalExpenses > 0 && (
            <div className="col-start-4 row-start-2 text-right text-[11px] font-medium tabular-nums theme-danger-text">
              −{formatCurrency(totalExpenses, settings.currency)}
            </div>
          )}
        </div>

        <ChevronDown className={`h-4 w-4 shrink-0 theme-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <div
        onClick={onExpand}
        className={`hidden items-center justify-between rounded-lg p-2.5 cursor-pointer transition-all lg:flex ${
          isDark
            ? 'bg-white/[0.03] hover:bg-white/[0.05]'
            : 'bg-white/80 hover:bg-slate-50'
        } ${isExpanded ? 'ring-1 ring-white/10' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-[72px] text-sm font-medium theme-text-primary">
            {getDateLabel()}
          </div>
          <div className="flex items-center gap-1 theme-text-muted">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm font-semibold theme-text-primary">{formatTime(shift.totalMinutes)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`text-sm font-bold ${isHourly ? 'theme-income-text' : 'theme-info-text'}`}>
            {formatCurrency(baseEarnings, settings.currency)}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4.5 w-4.5 theme-text-muted" />
          ) : (
            <ChevronDown className="h-4.5 w-4.5 theme-text-muted" />
          )}
        </div>
      </div>
    </>
  );
});
ShiftRow.displayName = 'ShiftRow';

// Expanded shift details
const ShiftDetails = ({ shift, onEdit, onDelete, settings, t }) => {
  const { enabledFields } = settings;
  const isHourly = settings.workType !== 'pieceWork';
  const baseEarnings = calculateShiftBaseEarnings(shift, settings);
  const netTipsCard = calculateNetTipsCard(shift.tipsCard, settings.tipsCardPercent);
  const cardTipsDeduction = Math.max(0, (shift.tipsCard || 0) - netTipsCard);
  const totalExpenses = calculateTotalExpenses(shift.expenses);
  const netIncome = calculateShiftNetIncome(shift, settings);
  const isDark = settings.theme !== 'light';
  
  const avgPerHour = !isHourly && shift.totalMinutes > 0 && shift.earnedAmount > 0
    ? (shift.earnedAmount / (shift.totalMinutes / 60))
    : 0;
  
  // Collect stats
  const stats = [];
  
  if (!isHourly) {
    stats.push({
      icon: DollarSign,
      label: t.earnedAmount,
      value: formatCurrency(baseEarnings, settings.currency),
      color: 'theme-info-text'
    });
    if (shift.ordersCount > 0) {
      stats.push({ icon: Package, label: t.orders, value: shift.ordersCount, color: 'theme-info-text' });
    }
    if (avgPerHour > 0) {
      stats.push({ icon: DollarSign, label: t.avgPerHour, value: formatCurrency(avgPerHour, settings.currency), color: 'theme-warm-text' });
    }
  }
  
  if (enabledFields.mileage && shift.mileage > 0) {
    stats.push({ icon: Car, label: t.mileage, value: `${shift.mileage} ${t.km}`, color: 'theme-text-primary' });
  }
  if (enabledFields.tipsCash && shift.tipsCash > 0) {
    stats.push({ icon: Banknote, label: t.tipsCash, value: formatCurrency(shift.tipsCash, settings.currency), color: 'theme-income-soft-text' });
  }
  if (enabledFields.tipsCard && shift.tipsCard > 0) {
    stats.push({ icon: CreditCard, label: t.tipsCard, value: formatCurrency(netTipsCard, settings.currency), color: 'theme-info-text' });
  }
  if (enabledFields.expenses && totalExpenses > 0) {
    stats.push({ icon: Receipt, label: t.expenses, value: `-${formatCurrency(totalExpenses, settings.currency)}`, color: 'theme-danger-text' });
  }
  if (enabledFields.bonus && shift.bonus > 0) {
    stats.push({ icon: Gift, label: t.bonus, value: formatCurrency(shift.bonus, settings.currency), color: 'theme-warm-text' });
  }

  const breakdown = [
    {
      label: isHourly ? (t.baseEarnings || t.earnings) : t.earnedAmount,
      value: baseEarnings,
      tone: 'positive'
    }
  ];

  if (enabledFields.tipsCash && shift.tipsCash > 0) {
    breakdown.push({
      label: t.tipsCash,
      value: shift.tipsCash,
      tone: 'positive'
    });
  }

  if (enabledFields.tipsCard && shift.tipsCard > 0) {
    breakdown.push({
      label: t.tipsCard,
      value: netTipsCard,
      tone: 'positive',
      meta: settings.tipsCardPercent > 0
        ? `${formatCurrency(shift.tipsCard, settings.currency)} - ${formatCurrency(cardTipsDeduction, settings.currency)} ${t.deduction?.toLowerCase?.() || 'deduction'}`
        : null
    });
  }

  if (enabledFields.bonus && shift.bonus > 0) {
    breakdown.push({
      label: t.bonus,
      value: shift.bonus,
      tone: 'positive'
    });
  }

  if (enabledFields.expenses && totalExpenses > 0) {
    breakdown.push({
      label: t.expenses,
      value: totalExpenses,
      tone: 'negative'
    });
  }

  const breakdownLabels = new Set(breakdown.map(item => item.label));
  const summaryStats = stats.filter(stat => !breakdownLabels.has(stat.label));
  
  return (
    <div className={`px-3 pb-3 pt-1 animate-fade-in lg:mt-2 lg:rounded-lg lg:p-3 ${
      isDark ? 'bg-white/[0.03]' : 'bg-slate-50 lg:bg-slate-100/80'
    }`}>
      <div className={`mb-2.5 rounded-xl border p-3 lg:rounded-lg lg:p-2.5 ${
        isDark
          ? 'border-white/[0.06] bg-slate-800/50 lg:border-white/[0.05] lg:bg-[#232428]'
          : 'border-slate-200 bg-white lg:bg-white/80'
      }`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="theme-text-primary text-sm font-bold">{t.netIncome}</span>
          <span className="theme-income-text text-xl font-bold">{formatCurrency(netIncome, settings.currency)}</span>
        </div>
        <div className="space-y-2">
          {breakdown.map((item, index) => {
            const isNegative = item.tone === 'negative';
            const sign = isNegative ? '-' : '+';
            const valueClass = isNegative ? 'theme-danger-text' : 'theme-income-text';

            return (
              <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="theme-text-secondary flex items-center gap-2">
                    <span className={`font-semibold ${valueClass}`}>{sign}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.meta && (
                    <div className="mt-0.5 pl-5 text-xs theme-text-muted">
                      {item.meta}
                    </div>
                  )}
                </div>
                <span className={`font-semibold ${valueClass}`}>
                  {formatCurrency(item.value, settings.currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {summaryStats.length > 0 && (
        <div className={`mb-2.5 rounded-lg border p-2.5 ${isDark ? 'border-white/[0.05] bg-[#202125]' : 'border-slate-200 bg-white/70'}`}>
            <div className="mb-2 text-sm font-bold theme-text-primary">
              {t.additional}
            </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {summaryStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
              <div key={index} className={`rounded-lg p-2 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] theme-text-muted">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="truncate">{stat.label}</span>
                  </div>
                  <div className={`font-semibold text-sm ${stat.color}`}>{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(shift)} icon={Edit3} className="flex-1">
          {t.edit}
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(shift.id)} icon={Trash2}>
          {t.delete}
        </Button>
      </div>
    </div>
  );
};

const ShiftsScreen = () => {
  const { t, shifts, settings, deleteShift } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [monthsOpen, setMonthsOpen] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShowModal(true);
  };
  
  const handleDeleteRequest = (shift) => {
    setShiftToDelete(shift);
  };

  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return;

    setDeleting(true);
    try {
      await deleteShift(shiftToDelete.id);
      setExpandedId(null);
      setShiftToDelete(null);
    } catch (error) {
      console.error('Error deleting shift:', error);
    } finally {
      setDeleting(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShift(null);
  };

  const currentMonthDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const currentMonthKey = useMemo(() => (
    `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`
  ), [currentMonthDate]);

  const monthOptions = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const currentMonthIndex = currentMonthDate.getMonth();

    return Array.from({ length: currentMonthIndex + 1 }, (_, offset) => {
      const monthIndex = currentMonthIndex - offset;
      const monthDate = new Date(year, monthIndex, 1);
      return {
        value: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
        label: formatDate(monthDate, settings.language, 'LLLL yyyy')
      };
    });
  }, [currentMonthDate, settings.language]);

  const visibleMonthDate = useMemo(() => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonthKey]);

  const visibleMonthLabel = useMemo(() => (
    formatDate(visibleMonthDate, settings.language, 'LLLL yyyy')
  ), [visibleMonthDate, settings.language]);

  const visibleShifts = useMemo(() => {
    const visibleYear = visibleMonthDate.getFullYear();
    const visibleMonth = visibleMonthDate.getMonth();

    return shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        return shiftDate.getFullYear() === visibleYear && shiftDate.getMonth() === visibleMonth;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [shifts, visibleMonthDate]);

  const visibleStats = useMemo(() => calculateStatistics(visibleShifts, settings), [visibleShifts, settings]);
  const weekGroups = useMemo(
    () => groupShiftsByWeek(visibleShifts, settings.language),
    [visibleShifts, settings.language]
  );
  const visibleMonthShortLabel = useMemo(
    () => formatDate(visibleMonthDate, settings.language, 'LLLL').toUpperCase(),
    [visibleMonthDate, settings.language]
  );
  const isDark = settings.theme !== 'light';
  
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight theme-text-primary lg:text-2xl lg:tracking-normal">
          {t.shifts}
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          icon={Plus}
          size="sm"
          className="lg:px-4 lg:py-2.5 lg:text-base"
        >
          {t.addShift}
        </Button>
      </div>
      
      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)] lg:items-start lg:gap-x-6">
        {/* Mobile monthly summary */}
        <div className={`relative z-20 order-1 mb-4 rounded-2xl border px-4 py-4 lg:hidden ${
          isDark
            ? 'border-white/[0.05] bg-slate-800/55'
            : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.14em] theme-text-muted">
              {visibleMonthShortLabel} · {visibleStats.shiftsCount}{' '}
              {shiftCountLabels[settings.language] || (t.shiftsCount || '').toLowerCase()}
            </div>
            <button
              type="button"
              onClick={() => setMonthsOpen(prev => !prev)}
              className="flex shrink-0 items-center gap-1 text-sm theme-text-secondary"
            >
              <span className="capitalize">{visibleMonthLabel}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${monthsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="mt-3 text-[32px] font-bold leading-none tabular-nums theme-text-primary">
            {formatCurrency(visibleStats.totalEarnings, settings.currency)}
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs theme-text-muted">
            <span>
              <span className="font-medium tabular-nums theme-text-secondary">
                {formatTime(visibleStats.totalMinutes)}
              </span>{' '}
              {t.hoursShort || 'h'}
            </span>
            {visibleStats.totalMileage > 0 && (
              <>
                <span className="opacity-40">·</span>
                <span>
                  <span className="font-medium tabular-nums theme-text-secondary">
                    {visibleStats.totalMileage}
                  </span>{' '}
                  {t.km || 'km'}
                </span>
              </>
            )}
          </div>

          {monthsOpen && (
            <div className={`absolute left-3 right-3 top-[calc(100%+4px)] space-y-1 rounded-2xl border p-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] animate-fade-in ${
              isDark
                ? 'border-white/[0.08] bg-slate-800'
                : 'border-slate-200 bg-white'
            }`}>
              {monthOptions.map((option) => {
                const isActive = selectedMonthKey === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedMonthKey(option.value);
                      setExpandedId(null);
                      setMonthsOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium capitalize transition-all ${
                      isActive
                        ? 'theme-bg-input theme-text-primary'
                        : 'theme-text-secondary hover:bg-white/[0.04]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Existing desktop month selector */}
        <Card className="relative z-20 hidden overflow-visible p-0 lg:col-start-1 lg:row-start-1 lg:mb-4 lg:block">
          <button
            type="button"
            onClick={() => setMonthsOpen(prev => !prev)}
            className="relative flex w-full items-center gap-3 overflow-hidden rounded-[15px] p-4 text-left"
          >
            <div className="relative min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold capitalize theme-text-primary">
                  {visibleMonthLabel}
                </span>
              </div>
            </div>
            {monthsOpen ? (
              <ChevronUp className="relative h-4.5 w-4.5 flex-shrink-0 theme-text-muted" />
            ) : (
              <ChevronDown className="relative h-4.5 w-4.5 flex-shrink-0 theme-text-muted" />
            )}
          </button>
          {monthsOpen && (
            <div className="absolute left-4 right-4 top-[calc(100%-0.25rem)] space-y-2 rounded-2xl border p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] animate-fade-in theme-border theme-surface-strong">
              {monthOptions.map((option) => {
                const isActive = selectedMonthKey === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedMonthKey(option.value);
                      setExpandedId(null);
                      setMonthsOpen(false);
                    }}
                    className={`w-full rounded-xl border px-3.5 py-3 text-left capitalize transition-all ${
                      isActive
                        ? 'theme-bg-input theme-text-primary border-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.16)]'
                        : 'theme-text-secondary border-transparent bg-white/[0.03] hover:border-white/8 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {visibleShifts.length > 0 && (
          <div className="hidden lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
            <div className="grid grid-cols-1 gap-3">
              <Card className="p-3.5">
                <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                  {t.shiftsCount}
                </div>
                <div className="theme-text-primary text-xl font-bold">
                  {visibleStats.shiftsCount}
                </div>
              </Card>
              <Card className="p-3.5">
                <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                  {t.totalHours}
                </div>
                <div className="theme-text-primary text-xl font-bold">
                  {formatTime(visibleStats.totalMinutes)}
                </div>
              </Card>
              <Card className="p-3.5">
                <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                  {settings.workType !== 'pieceWork' ? t.totalEarnings : t.earnedAmount}
                </div>
                <div className="theme-income-text text-xl font-bold">
                  {formatCurrency(visibleStats.totalEarnings, settings.currency)}
                </div>
              </Card>
            </div>
          </div>
        )}

        <div className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
          {visibleShifts.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t.noShifts}
              description={t.noData}
              action={
                selectedMonthKey === currentMonthKey ? (
                  <Button onClick={() => setShowModal(true)} icon={Plus}>
                    {t.addShift}
                  </Button>
                ) : null
              }
            />
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {weekGroups.map((group) => {
                  const weekTotal = group.shifts.reduce((sum, shift) => (
                    sum
                    + calculateShiftNetIncome(shift, settings)
                    + calculateTotalExpenses(shift.expenses)
                  ), 0);
                  const weekMinutes = group.shifts.reduce(
                    (sum, shift) => sum + (shift.totalMinutes || 0),
                    0
                  );

                  return (
                    <div key={group.weekStart.toISOString()}>
                      <div className="mb-1.5 flex items-baseline justify-between px-1">
                        <div className="text-[13px] font-semibold theme-text-secondary">
                          {weekLabels[settings.language] || weekLabels.ru} {group.label}
                        </div>
                        <div className="text-[11px] theme-text-muted">
                          <span className="font-medium tabular-nums theme-text-secondary">
                            {formatTime(weekMinutes)}
                          </span>
                          <span className="mx-1.5 opacity-40">·</span>
                          <span className="font-medium tabular-nums theme-text-secondary">
                            {formatCurrency(weekTotal, settings.currency)}
                          </span>
                        </div>
                      </div>

                      <div className={`overflow-hidden rounded-2xl border ${
                        isDark
                          ? 'border-white/[0.05] bg-slate-800/30'
                          : 'border-slate-200 bg-white'
                      }`}>
                        {group.shifts.map((shift, index) => (
                          <React.Fragment key={shift.id}>
                            <ShiftRow
                              shift={shift}
                              settings={settings}
                              t={t}
                              isExpanded={expandedId === shift.id}
                              isLast={index === group.shifts.length - 1 && expandedId !== shift.id}
                              onExpand={() => setExpandedId(expandedId === shift.id ? null : shift.id)}
                            />
                            {expandedId === shift.id && (
                              <ShiftDetails
                                shift={shift}
                                settings={settings}
                                t={t}
                                onEdit={handleEdit}
                                onDelete={() => handleDeleteRequest(shift)}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Card className="hidden p-2.5 lg:block lg:p-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <div>
                    <div className="theme-text-muted text-[11px] uppercase tracking-[0.16em]">
                      {t.shifts}
                    </div>
                    <div className="theme-text-primary mt-1 text-base font-semibold capitalize">
                      {visibleMonthLabel}
                    </div>
                  </div>
                  <div className="theme-text-muted text-sm">
                    {visibleStats.shiftsCount} {t.shiftsCount}
                  </div>
                </div>
                <div className="space-y-2">
                  {visibleShifts.map((shift) => (
                    <div key={shift.id}>
                      <ShiftRow
                        shift={shift}
                        settings={settings}
                        t={t}
                        isExpanded={expandedId === shift.id}
                        onExpand={() => setExpandedId(expandedId === shift.id ? null : shift.id)}
                      />
                      {expandedId === shift.id && (
                        <ShiftDetails
                          shift={shift}
                          settings={settings}
                          t={t}
                          onEdit={handleEdit}
                          onDelete={() => handleDeleteRequest(shift)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Suspense fallback={null}>
          <ShiftModal
            isOpen={showModal}
            onClose={handleCloseModal}
            shift={editingShift}
          />
        </Suspense>
      )}

      <Modal
        isOpen={!!shiftToDelete}
        onClose={() => !deleting && setShiftToDelete(null)}
        title={t.delete}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShiftToDelete(null)}
              className="flex-1"
              disabled={deleting}
            >
              {t.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              className="flex-1"
              loading={deleting}
            >
              {t.delete}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            settings.theme !== 'light'
              ? 'bg-[#b4877f]/16 text-[#d9b6b0]'
              : 'bg-red-100 text-red-600'
          }`}>
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="theme-text-primary text-base font-semibold">
              {t.deleteConfirm}
            </p>
            {shiftToDelete && (
              <p className="mt-2 theme-text-muted text-sm">
                {formatDate(shiftToDelete.date, settings.language)} • {formatTime(shiftToDelete.totalMinutes)}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShiftsScreen;
