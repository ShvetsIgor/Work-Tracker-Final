import React, { lazy, Suspense, useState, useMemo } from 'react';
import { Plus, Car, Banknote, CreditCard, Gift, Receipt, Trash2, Edit3, ClipboardList, Package, DollarSign, ChevronDown, AlertTriangle } from 'lucide-react';
import { parseISO, startOfWeek, format } from 'date-fns';
import { ru, enUS, he } from 'date-fns/locale';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { formatDate, isToday, isYesterday } from '@/utils/dateUtils';
import { calculateShiftBaseEarnings, calculateNetTipsCard, calculateTotalExpenses, calculateShiftNetIncome, calculateStatistics, calculateOtherIncomeTotal, getOtherIncomeItems } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';

const ShiftModal = lazy(() => import('@/components/ShiftModal'));

const locales = { ru, en: enUS, he };

const groupShiftsByWeek = (shifts, language = 'ru') => {
  const locale = locales[language] || ru;
  const buckets = new Map();

  shifts.forEach((shift) => {
    const date = parseISO(shift.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');

    if (!buckets.has(key)) {
      buckets.set(key, { weekStart, shifts: [] });
    }
    buckets.get(key).shifts.push(shift);
  });

  return Array.from(buckets.values())
    .sort((a, b) => b.weekStart - a.weekStart)
    .map(({ weekStart, shifts: weekShifts }) => {
      const label = format(weekStart, 'd MMM', { locale });
      return { weekStart, label, shifts: weekShifts };
    });
};

const ShiftRow = ({ shift, onExpand, isExpanded, settings, t, isLast }) => {
  const baseEarnings = calculateShiftBaseEarnings(shift, settings);
  const isDark = settings.theme !== 'light';
  const netTipsCard = calculateNetTipsCard(shift.tipsCard, settings.tipsCardPercent);
  const totalExpenses = calculateTotalExpenses(shift.expenses);
  const totalEarnings = baseEarnings + (shift.tipsCash || 0) + netTipsCard + calculateOtherIncomeTotal(shift);

  const shiftDate = parseISO(shift.date);
  const dayNumber = shiftDate.getDate();
  const dow = format(shiftDate, 'EEEEEE', { locale: locales[settings.language] || ru }).toLowerCase();

  const tipsTotal = (shift.tipsCash || 0) + netTipsCard;

  return (
    <button
      onClick={onExpand}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
        !isLast ? (isDark ? 'border-b border-white/[0.04]' : 'border-b border-slate-200/70') : ''
      } ${isExpanded ? (isDark ? 'bg-white/[0.03]' : 'bg-slate-50') : 'hover:bg-white/[0.02]'}`}
    >
      {/* Date stamp */}
      <div className="flex w-10 flex-col items-center leading-none shrink-0">
        <div className="theme-text-primary text-lg font-bold tabular-nums">
          {dayNumber}
        </div>
        <div className="theme-text-muted mt-1 text-[10px] uppercase tracking-wide">
          {dow}
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 text-sm font-medium theme-text-primary">
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
            <span className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--accent-soft)]">
              {t.today}
            </span>
          )}
        </div>
        {(tipsTotal > 0 || shift.mileage > 0) && (
          <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] theme-text-muted">
            {tipsTotal > 0 && (
              <span>{(t.tips || 'чаевые').toLowerCase()} <span className="tabular-nums font-medium">{formatCurrency(tipsTotal, settings.currency)}</span></span>
            )}
            {shift.mileage > 0 && (
              <span><span className="tabular-nums font-medium">{shift.mileage}</span> {t.km || 'км'}</span>
            )}
          </div>
        )}
      </div>

      {/* Earnings */}
      <div className="text-right shrink-0">
        <div className="theme-text-primary text-sm font-bold tabular-nums">
          {formatCurrency(totalEarnings, settings.currency)}
        </div>
        {totalExpenses > 0 && (
          <div className="mt-0.5 text-[11px] font-medium tabular-nums theme-danger-text">
            −{formatCurrency(totalExpenses, settings.currency)}
          </div>
        )}
      </div>

      <ChevronDown className={`h-4 w-4 theme-text-muted shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
    </button>
  );
};

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

  const extraStats = [];

  if (!isHourly && shift.ordersCount > 0) {
    extraStats.push({ icon: Package, label: t.orders, value: shift.ordersCount });
  }
  if (!isHourly && avgPerHour > 0) {
    extraStats.push({ icon: DollarSign, label: t.avgPerHour, value: formatCurrency(avgPerHour, settings.currency) });
  }
  if (enabledFields.mileage && shift.mileage > 0) {
    extraStats.push({ icon: Car, label: t.mileage, value: `${shift.mileage} ${t.km}` });
  }

  const breakdown = [
    { label: isHourly ? (t.baseEarnings || t.earnings) : t.earnedAmount, value: baseEarnings, tone: 'positive' }
  ];

  if (enabledFields.tipsCash && shift.tipsCash > 0) {
    breakdown.push({ label: t.tipsCash, value: shift.tipsCash, tone: 'positive' });
  }
  if (enabledFields.tipsCard && shift.tipsCard > 0) {
    breakdown.push({
      label: t.tipsCard,
      value: netTipsCard,
      tone: 'positive',
      meta: settings.tipsCardPercent > 0
        ? `${formatCurrency(shift.tipsCard, settings.currency)} − ${formatCurrency(cardTipsDeduction, settings.currency)} ${t.deduction?.toLowerCase?.() || 'deduction'}`
        : null
    });
  }
  if (enabledFields.bonus) {
    getOtherIncomeItems(shift).forEach((item) => {
      breakdown.push({
        label: item.comment?.trim() || (t.otherIncome || 'Доход'),
        value: item.amount || 0,
        tone: 'positive'
      });
    });
  }
  if (enabledFields.expenses && totalExpenses > 0) {
    breakdown.push({ label: t.expenses, value: totalExpenses, tone: 'negative' });
  }

  return (
    <div className={`px-3 pb-3 pt-1 animate-fade-in ${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
      {/* Net income card */}
      <div className={`rounded-xl border p-3 ${isDark ? 'border-white/[0.06] bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="theme-text-muted text-[11px] uppercase tracking-[0.14em] font-semibold">
            {t.netIncome}
          </span>
          <span className="theme-text-primary text-lg font-bold tabular-nums">
            {formatCurrency(netIncome, settings.currency)}
          </span>
        </div>
        <div className="space-y-1.5 pt-1">
          {breakdown.map((item, index) => {
            const isNegative = item.tone === 'negative';
            const valueClass = isNegative ? 'theme-danger-text' : 'theme-income-text';
            return (
              <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="theme-text-secondary">
                    {isNegative ? '− ' : ''}{item.label}
                  </div>
                  {item.meta && (
                    <div className="mt-0.5 text-[11px] theme-text-muted">{item.meta}</div>
                  )}
                </div>
                <span className={`font-semibold tabular-nums ${valueClass}`}>
                  {isNegative ? '−' : ''}{formatCurrency(item.value, settings.currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra stats */}
      {extraStats.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {extraStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`rounded-lg p-2 ${isDark ? 'bg-slate-800/50' : 'bg-white'} border ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
                <div className="mb-0.5 flex items-center gap-1 text-[10px] theme-text-muted">
                  <Icon className="h-3 w-3" />
                  <span className="truncate">{stat.label}</span>
                </div>
                <div className="theme-text-primary text-sm font-semibold tabular-nums">{stat.value}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
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

// Treat the day as ending at 03:00 (not midnight) so a late shift on
// the last day of a month doesn't accidentally land in the next month.
// e.g. opening the app on May 1st at 00:15 still shows April.
const getEffectiveNow = () => {
  const d = new Date();
  d.setHours(d.getHours() - 3);
  return d;
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
    const now = getEffectiveNow();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const isDark = settings.theme !== 'light';

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
    const now = getEffectiveNow();
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
  const weekGroups = useMemo(() => groupShiftsByWeek(visibleShifts, settings.language), [visibleShifts, settings.language]);

  const totalMileage = useMemo(
    () => visibleShifts.reduce((sum, s) => sum + (s.mileage || 0), 0),
    [visibleShifts]
  );

  const monthShortLabel = formatDate(visibleMonthDate, settings.language, 'LLLL').toUpperCase();

  return (
    <div className="pb-24">
      {/* Title row */}
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-3xl font-bold theme-text-primary tracking-tight">{t.shifts}</h1>
        <div className="hidden lg:block">
          <Button onClick={() => setShowModal(true)} icon={Plus} size="sm">
            {t.addShift}
          </Button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)] lg:gap-6 lg:items-start">
        <div className="min-w-0">
          {/* Period hero summary */}
          <div className={`relative z-20 mb-4 rounded-2xl border px-4 py-4 ${isDark ? 'border-white/[0.05] bg-slate-800/55' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div className="theme-text-muted text-[11px] uppercase tracking-[0.14em] font-semibold">
                {monthShortLabel} · {visibleStats.shiftsCount} {(t.shiftsCount || '').toLowerCase()}
              </div>
              <button
                type="button"
                onClick={() => setMonthsOpen(prev => !prev)}
                className="flex items-center gap-1 theme-text-secondary text-sm hover:theme-text-primary"
              >
                <span className="capitalize">{visibleMonthLabel}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${monthsOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <div className="theme-text-primary font-display text-[36px] leading-none tabular-nums">
                {formatCurrency(visibleStats.totalEarnings, settings.currency)}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3 text-xs theme-text-muted">
              <span><span className="tabular-nums font-medium theme-text-secondary">{formatTime(visibleStats.totalMinutes)}</span> {t.hoursShort || 'ч'}</span>
              {totalMileage > 0 && (
                <>
                  <span className="opacity-40">·</span>
                  <span><span className="tabular-nums font-medium theme-text-secondary">{totalMileage}</span> {t.km || 'км'}</span>
                </>
              )}
            </div>

            {monthsOpen && (
              <div className={`absolute left-3 right-3 top-[calc(100%+4px)] space-y-1 rounded-2xl border p-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] animate-fade-in ${isDark ? 'border-white/[0.08] bg-slate-800' : 'border-slate-200 bg-white'}`}>
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
                      className={`w-full rounded-xl px-3 py-2.5 text-left capitalize text-sm font-medium transition-all ${
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

          {/* Weeks */}
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
            <div className="space-y-4">
              {weekGroups.map((group) => {
                const weekTotal = group.shifts.reduce((sum, s) => {
                  const base = calculateShiftBaseEarnings(s, settings);
                  const netCard = calculateNetTipsCard(s.tipsCard, settings.tipsCardPercent);
                  return sum + base + (s.tipsCash || 0) + netCard + (s.bonus || 0);
                }, 0);
                const weekMinutes = group.shifts.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);

                return (
                  <div key={group.weekStart.toISOString()}>
                    <div className="mb-1.5 flex items-baseline justify-between px-1">
                      <div className="theme-text-secondary text-[13px] font-semibold">
                        {t.weekOf || 'Неделя'} {group.label}
                      </div>
                      <div className="theme-text-muted text-[11px]">
                        <span className="tabular-nums font-medium theme-text-secondary">{formatTime(weekMinutes)}</span>
                        <span className="mx-1.5 opacity-40">·</span>
                        <span className="tabular-nums font-medium theme-text-secondary">{formatCurrency(weekTotal, settings.currency)}</span>
                      </div>
                    </div>

                    <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-white/[0.05] bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
                      {group.shifts.map((shift, idx) => (
                        <React.Fragment key={shift.id}>
                          <ShiftRow
                            shift={shift}
                            settings={settings}
                            t={t}
                            isExpanded={expandedId === shift.id}
                            isLast={idx === group.shifts.length - 1 && expandedId !== shift.id}
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
          )}
        </div>

        {/* Desktop sidebar stats */}
        <div className="mt-4 hidden lg:sticky lg:top-28 lg:mt-0 lg:block">
          {visibleShifts.length > 0 && (
            <div className={`space-y-2 rounded-2xl border p-3 ${isDark ? 'border-white/[0.05] bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
              <SidebarStatRow label={t.shiftsCount} value={visibleStats.shiftsCount} />
              <SidebarStatRow label={t.totalHours} value={formatTime(visibleStats.totalMinutes)} />
              <SidebarStatRow
                label={settings.workType !== 'pieceWork' ? t.totalEarnings : t.earnedAmount}
                value={formatCurrency(visibleStats.totalEarnings, settings.currency)}
                accent
              />
              {totalMileage > 0 && (
                <SidebarStatRow label={t.mileage} value={`${totalMileage} ${t.km || 'км'}`} />
              )}
            </div>
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
            isDark
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

      <button
        type="button"
        onClick={() => setShowModal(true)}
        aria-label={t.addShift}
        className="fixed left-1/2 z-40 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full px-5 font-semibold tracking-[-0.01em] shadow-[0_10px_24px_rgba(0,0,0,0.28)] active:scale-95 transition-transform lg:hidden"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
          background: 'var(--accent-secondary)',
          color: 'var(--accent-text)'
        }}
      >
        <Plus className="h-5 w-5" />
        <span>{t.addShift}</span>
      </button>
    </div>
  );
};

const SidebarStatRow = ({ label, value, accent }) => (
  <div className="flex items-baseline justify-between">
    <span className="theme-text-muted text-[11px] uppercase tracking-[0.14em] font-semibold">{label}</span>
    <span className={`text-base font-bold tabular-nums ${accent ? 'theme-income-text' : 'theme-text-primary'}`}>{value}</span>
  </div>
);

export default ShiftsScreen;
