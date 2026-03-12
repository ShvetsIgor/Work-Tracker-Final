import React, { lazy, Suspense, useState, useMemo } from 'react';
import { Plus, Clock, Car, Banknote, CreditCard, Gift, Receipt, Trash2, Edit3, ClipboardList, Package, DollarSign, ChevronDown, ChevronUp, CalendarRange, BarChart3, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button, Card, EmptyState } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { formatDate, isToday, isYesterday } from '@/utils/dateUtils';
import { calculateShiftBaseEarnings, calculateNetTipsCard, calculateTotalExpenses, calculateShiftNetIncome } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';

const ShiftModal = lazy(() => import('@/components/ShiftModal'));

// Compact shift row
const ShiftRow = ({ shift, onExpand, isExpanded, settings, t }) => {
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
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
        isDark 
          ? 'bg-slate-800/50 hover:bg-slate-700/50' 
          : 'bg-white/80 hover:bg-slate-50'
      } ${isExpanded ? 'ring-2 ring-purple-500' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="theme-text-primary font-medium min-w-[80px]">
          {getDateLabel()}
        </div>
        <div className="flex items-center gap-1 theme-text-muted">
          <Clock className="w-4 h-4" />
          <span className="font-semibold theme-text-primary">{formatTime(shift.totalMinutes)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`font-bold ${isHourly ? 'text-green-400' : 'text-blue-400'}`}>
          {formatCurrency(baseEarnings, settings.currency)}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 theme-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 theme-text-muted" />
        )}
      </div>
    </div>
  );
};

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
      color: 'text-blue-400'
    });
    if (shift.ordersCount > 0) {
      stats.push({ icon: Package, label: t.orders, value: shift.ordersCount, color: 'text-blue-400' });
    }
    if (avgPerHour > 0) {
      stats.push({ icon: DollarSign, label: t.avgPerHour, value: formatCurrency(avgPerHour, settings.currency), color: 'text-purple-400' });
    }
  }
  
  if (enabledFields.mileage && shift.mileage > 0) {
    stats.push({ icon: Car, label: t.mileage, value: `${shift.mileage} ${t.km}`, color: 'theme-text-primary' });
  }
  if (enabledFields.tipsCash && shift.tipsCash > 0) {
    stats.push({ icon: Banknote, label: t.tipsCash, value: formatCurrency(shift.tipsCash, settings.currency), color: 'text-green-400' });
  }
  if (enabledFields.tipsCard && shift.tipsCard > 0) {
    stats.push({ icon: CreditCard, label: t.tipsCard, value: formatCurrency(netTipsCard, settings.currency), color: 'text-green-400' });
  }
  if (enabledFields.expenses && totalExpenses > 0) {
    stats.push({ icon: Receipt, label: t.expenses, value: `-${formatCurrency(totalExpenses, settings.currency)}`, color: 'text-red-400' });
  }
  if (enabledFields.bonus && shift.bonus > 0) {
    stats.push({ icon: Gift, label: t.bonus, value: formatCurrency(shift.bonus, settings.currency), color: 'text-yellow-400' });
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
    <div className={`mt-2 p-4 rounded-xl animate-fade-in ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
      <div className={`mb-3 rounded-xl border p-3 ${isDark ? 'border-slate-600/40 bg-slate-800/35' : 'border-slate-200 bg-white/80'}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="theme-text-primary text-sm font-semibold">{t.netIncome}</span>
          <span className="text-purple-400 text-lg font-bold">{formatCurrency(netIncome, settings.currency)}</span>
        </div>
        <div className="space-y-2">
          {breakdown.map((item, index) => {
            const isNegative = item.tone === 'negative';
            const sign = isNegative ? '-' : '+';
            const valueClass = isNegative ? 'text-red-400' : 'text-emerald-400';

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
        <div className={`mb-3 rounded-xl border p-3 ${isDark ? 'border-slate-600/40 bg-slate-800/20' : 'border-slate-200 bg-white/70'}`}>
          <div className="mb-2 theme-text-primary text-sm font-semibold">
            {settings.language === 'ru' && 'Дополнительно'}
            {settings.language === 'en' && 'Additional'}
            {settings.language === 'he' && 'נוסף'}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {summaryStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`rounded-lg p-2.5 ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <div className="mb-1 flex items-center gap-1.5 theme-text-muted text-xs">
                    <Icon className="w-3.5 h-3.5" />
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

  const currentMonthLabel = useMemo(() => {
    const now = new Date();
    return formatDate(now, settings.language, 'LLLL yyyy');
  }, [settings.language]);
  
  // Filter to current month only and sort by date
  const currentMonthShifts = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate.getFullYear() === currentYear && shiftDate.getMonth() === currentMonth;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [shifts]);
  
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold theme-text-primary">{t.shifts}</h1>
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          {t.addShift}
        </Button>
      </div>

      <Card className={`mb-5 overflow-hidden ${settings.theme !== 'light' ? 'bg-slate-800/60' : 'bg-white/85 border border-slate-200'}`}>
        <div className="relative p-4">
          <div className={`absolute inset-0 ${settings.theme !== 'light' ? 'bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-transparent' : 'bg-gradient-to-r from-purple-100/80 via-blue-50/70 to-transparent'}`} />
          <div className="relative flex items-start gap-3">
            <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${settings.theme !== 'light' ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
              <CalendarRange className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${settings.theme !== 'light' ? 'bg-slate-700/70 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                  {t.thisMonth}
                </span>
                <span className="theme-text-primary text-sm font-semibold capitalize">{currentMonthLabel}</span>
              </div>
              <p className="theme-text-secondary text-sm leading-relaxed">
                {settings.language === 'ru' && `Здесь собраны смены за текущий месяц. История и гибкий список смен доступны во вкладке ${t.statistics.toLowerCase()}.`}
                {settings.language === 'en' && `This screen shows your current month shifts. Full history and the flexible shift list are available in ${t.statistics}.`}
                {settings.language === 'he' && `כאן מוצגות המשמרות של החודש הנוכחי. היסטוריה מלאה ורשימת משמרות גמישה זמינות בלשונית ${t.statistics}.`}
              </p>
            </div>
            <div className={`hidden sm:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${settings.theme !== 'light' ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Shifts List */}
      {currentMonthShifts.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t.noShifts}
          description={t.noData}
          action={
            <Button onClick={() => setShowModal(true)} icon={Plus}>
              {t.addShift}
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {currentMonthShifts.map((shift) => (
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
      )}
      
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
              ? 'bg-red-500/15 text-red-300'
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
