import React, { useState } from 'react';
import { Plus, Clock, Car, Banknote, CreditCard, Gift, Receipt, Trash2, Edit3, ClipboardList, Package, DollarSign } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ShiftModal from '@/components/ShiftModal';
import { Button, Card, Badge, EmptyState } from '@/components/ui';
import { formatDate, isToday, isYesterday } from '@/utils/dateUtils';
import { calculateEarnings, calculateNetTipsCard, calculateTotalExpenses, calculateShiftNetIncome } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';

const ShiftCard = ({ shift, onEdit, onDelete }) => {
  const { t, settings } = useApp();
  const { enabledFields } = settings;
  
  const isHourly = settings.workType !== 'pieceWork';
  const netTipsCard = calculateNetTipsCard(shift.tipsCard, settings.tipsCardPercent);
  const totalExpenses = calculateTotalExpenses(shift.expenses);
  const netIncome = calculateShiftNetIncome(shift, settings);
  
  // Calculate avg per hour for piece-work
  const avgPerHour = !isHourly && shift.totalMinutes > 0 && shift.earnedAmount > 0
    ? (shift.earnedAmount / (shift.totalMinutes / 60))
    : 0;
  
  const isDark = settings.theme !== 'light';
  
  const getDateLabel = () => {
    if (isToday(shift.date)) return t.today;
    if (isYesterday(shift.date)) return t.yesterday;
    return formatDate(shift.date, settings.language);
  };
  
  // Collect all stats to display
  const stats = [];
  
  // For piece-work: show orders and avg per hour
  if (!isHourly) {
    if (shift.ordersCount > 0) {
      stats.push({
        icon: Package,
        label: t.orders,
        value: shift.ordersCount,
        color: 'text-blue-400'
      });
    }
    if (avgPerHour > 0) {
      stats.push({
        icon: DollarSign,
        label: t.avgPerHour,
        value: formatCurrency(avgPerHour, settings.currency),
        color: 'text-purple-400'
      });
    }
  }
  
  if (enabledFields.mileage && shift.mileage > 0) {
    stats.push({
      icon: Car,
      label: t.mileage,
      value: `${shift.mileage} ${t.km}`,
      color: 'theme-text-primary'
    });
  }
  if (enabledFields.tipsCash && shift.tipsCash > 0) {
    stats.push({
      icon: Banknote,
      label: t.tipsCash,
      value: formatCurrency(shift.tipsCash, settings.currency),
      color: 'text-green-400'
    });
  }
  if (enabledFields.tipsCard && shift.tipsCard > 0) {
    // Show gross (net) for card tips with currency symbol
    const grossFormatted = formatCurrency(shift.tipsCard, settings.currency);
    const netFormatted = formatCurrency(netTipsCard, settings.currency);
    const displayValue = settings.tipsCardPercent > 0 
      ? `${grossFormatted} (${netFormatted})`
      : grossFormatted;
    stats.push({
      icon: CreditCard,
      label: t.tipsCard,
      value: displayValue,
      color: 'text-green-400'
    });
  }
  if (enabledFields.expenses && totalExpenses > 0) {
    stats.push({
      icon: Receipt,
      label: t.expenses,
      value: `-${formatCurrency(totalExpenses, settings.currency)}`,
      color: 'text-red-400'
    });
  }
  if (enabledFields.bonus && shift.bonus > 0) {
    stats.push({
      icon: Gift,
      label: t.bonus,
      value: formatCurrency(shift.bonus, settings.currency),
      color: 'text-yellow-400'
    });
  }
  
  return (
    <Card className="p-4 animate-fade-in" hover>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="theme-text-primary font-semibold">{getDateLabel()}</div>
          <div className="theme-text-muted text-sm flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(shift.totalMinutes)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-purple-400 font-bold text-lg">
            {formatCurrency(netIncome, settings.currency)}
          </div>
          <div className="theme-text-muted text-xs">{t.netIncome}</div>
        </div>
      </div>
      
      {/* Stats Grid - Equal sized, centered blocks */}
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className={`rounded-lg p-3 flex flex-col items-center justify-between min-h-[70px] ${
                  isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-1 theme-text-muted text-xs text-center">
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{stat.label}</span>
                </div>
                <div className={`font-semibold text-sm mt-1 ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onEdit(shift)}
          icon={Edit3}
          className="flex-1"
        >
          {t.edit}
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => onDelete(shift.id)}
          icon={Trash2}
        >
          {t.delete}
        </Button>
      </div>
    </Card>
  );
};

const ShiftsScreen = () => {
  const { t, shifts, deleteShift } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShowModal(true);
  };
  
  const handleDelete = async (shiftId) => {
    if (deleteConfirm === shiftId) {
      await deleteShift(shiftId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(shiftId);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShift(null);
  };
  
  // Sort shifts by date (newest first)
  const sortedShifts = [...shifts].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
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
      {sortedShifts.length === 0 ? (
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
        <div className="space-y-3">
          {sortedShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
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
