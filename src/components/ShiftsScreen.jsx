import React, { useState, useMemo } from 'react';
import { Plus, Clock, Car, Banknote, CreditCard, Gift, Receipt, Trash2, Edit3, ClipboardList, Package, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ShiftModal from '@/components/ShiftModal';
import { Button, Card, EmptyState } from '@/components/ui';
import { formatDate, isToday, isYesterday } from '@/utils/dateUtils';
import { calculateEarnings, calculateNetTipsCard, calculateTotalExpenses, calculateShiftNetIncome } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';

// Compact shift row
const ShiftRow = ({ shift, onExpand, isExpanded, settings, t }) => {
  const baseEarnings = calculateEarnings(shift.totalMinutes, settings, shift.date);
  const isDark = settings.theme !== 'light';
  
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
        <div className="text-green-400 font-bold">
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
  const netTipsCard = calculateNetTipsCard(shift.tipsCard, settings.tipsCardPercent);
  const totalExpenses = calculateTotalExpenses(shift.expenses);
  const netIncome = calculateShiftNetIncome(shift, settings);
  const isDark = settings.theme !== 'light';
  
  const avgPerHour = !isHourly && shift.totalMinutes > 0 && shift.earnedAmount > 0
    ? (shift.earnedAmount / (shift.totalMinutes / 60))
    : 0;
  
  // Collect stats
  const stats = [];
  
  if (!isHourly) {
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
    const grossFormatted = formatCurrency(shift.tipsCard, settings.currency);
    const netFormatted = formatCurrency(netTipsCard, settings.currency);
    const displayValue = settings.tipsCardPercent > 0 ? `${grossFormatted} (${netFormatted})` : grossFormatted;
    stats.push({ icon: CreditCard, label: t.tipsCard, value: displayValue, color: 'text-green-400' });
  }
  if (enabledFields.expenses && totalExpenses > 0) {
    stats.push({ icon: Receipt, label: t.expenses, value: `-${formatCurrency(totalExpenses, settings.currency)}`, color: 'text-red-400' });
  }
  if (enabledFields.bonus && shift.bonus > 0) {
    stats.push({ icon: Gift, label: t.bonus, value: formatCurrency(shift.bonus, settings.currency), color: 'text-yellow-400' });
  }
  
  return (
    <div className={`mt-2 p-4 rounded-xl animate-fade-in ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`rounded-lg p-2 text-center ${isDark ? 'bg-slate-600/30' : 'bg-white/60'}`}>
                <div className="flex items-center justify-center gap-1 theme-text-muted text-xs">
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{stat.label}</span>
                </div>
                <div className={`font-semibold text-sm ${stat.color}`}>{stat.value}</div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Net income */}
      <div className={`p-3 rounded-lg mb-3 text-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
        <div className="theme-text-muted text-xs">{t.netIncome}</div>
        <div className="text-purple-400 font-bold text-xl">{formatCurrency(netIncome, settings.currency)}</div>
      </div>
      
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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShowModal(true);
  };
  
  const handleDelete = async (shiftId) => {
    if (deleteConfirm === shiftId) {
      await deleteShift(shiftId);
      setDeleteConfirm(null);
      setExpandedId(null);
    } else {
      setDeleteConfirm(shiftId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShift(null);
  };
  
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
                  onDelete={handleDelete}
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal */}
      <ShiftModal
        isOpen={showModal}
        onClose={handleCloseModal}
        shift={editingShift}
      />
    </div>
  );
};

export default ShiftsScreen;
