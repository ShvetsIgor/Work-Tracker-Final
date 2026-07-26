import React, { lazy, Suspense, useState, useMemo, memo } from 'react';
import { Plus, Clock, Car, Banknote, CreditCard, Gift, Receipt, Trash2, Edit3, ClipboardList, Package, DollarSign, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button, Card, EmptyState } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { formatDate, isToday, isYesterday } from '@/utils/dateUtils';
import { calculateShiftBaseEarnings, calculateNetTipsCard, calculateTotalExpenses, calculateShiftNetIncome, calculateStatistics } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';

const ShiftModal = lazy(() => import('@/components/ShiftModal'));

// Compact shift row
const ShiftRow = memo(({ shift, onExpand, isExpanded, settings, t }) => {
  const baseEarnings = calculateShiftBaseEarnings(shift, settings);
  const isDark = settings.theme !== 'light';
  const isHourly = settings.workType !== 'pieceWork';
  
  const getDateLabel = () => {
    if (isToday(shift.date)) return t.today;
    if (isYesterday(shift.date)) return t.yesterday;
    return formatDate(shift.date, settings.language);
  };
  
  return (
    <div 
      onClick={onExpand}
      className={`flex items-center justify-between rounded-lg p-2.5 cursor-pointer transition-all ${
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
  );
});

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
    <div className={`mt-2 rounded-lg p-3 animate-fade-in ${isDark ? 'bg-white/[0.03]' : 'bg-slate-100/80'}`}>
      <div className={`mb-2.5 rounded-lg border p-2.5 ${isDark ? 'border-white/[0.05] bg-[#232428]' : 'border-slate-200 bg-white/80'}`}>
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
  
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="text-2xl font-bold theme-text-primary">{t.shifts}</h1>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          {t.addShift}
        </Button>
      </div>
      
      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)] lg:gap-6 lg:items-start">
        <div className="order-first mb-3 lg:order-2 lg:mb-0 lg:sticky lg:top-20">
          {visibleShifts.length > 0 && (
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:space-y-3 lg:gap-0">
              <Card className="p-3 lg:p-3.5 lg:mb-3">
                <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                  {t.shiftsCount}
                </div>
                <div className="theme-text-primary text-base font-bold lg:text-xl">
                  {visibleStats.shiftsCount}
                </div>
              </Card>
              <Card className="p-3 lg:p-3.5 lg:mb-3">
                <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                  {t.totalHours}
                </div>
                <div className="theme-text-primary text-base font-bold lg:text-xl">
                  {formatTime(visibleStats.totalMinutes)}
                </div>
              </Card>
              <Card className="p-3 lg:p-3.5">
                <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                  {settings.workType !== 'pieceWork' ? t.totalEarnings : t.earnedAmount}
                </div>
                <div className="theme-income-text text-base font-bold lg:text-xl">
                  {formatCurrency(visibleStats.totalEarnings, settings.currency)}
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="min-w-0 lg:order-1">
          <Card className="relative z-20 mb-3 overflow-visible p-2.5 lg:p-3.5">
            <button
              type="button"
              onClick={() => setMonthsOpen(prev => !prev)}
              className="flex w-full items-center justify-between gap-3 rounded-xl text-left"
            >
              <div className="theme-text-primary text-base font-semibold capitalize">
                {visibleMonthLabel}
              </div>
              {monthsOpen ? (
                <ChevronUp className="h-4.5 w-4.5 theme-text-muted" />
              ) : (
                <ChevronDown className="h-4.5 w-4.5 theme-text-muted" />
              )}
            </button>
            {monthsOpen && (
              <div className="absolute left-2.5 right-2.5 top-[calc(100%-0.25rem)] space-y-2 rounded-2xl border theme-border theme-surface-strong p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] animate-fade-in lg:left-3.5 lg:right-3.5">
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
            <Card className="p-2.5 lg:p-3.5">
              <div className="mb-2.5 hidden items-center justify-between lg:flex">
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
