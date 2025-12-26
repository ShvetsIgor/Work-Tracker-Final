import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car, Banknote, CreditCard, Gift, Receipt, Package, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Modal from '@/components/ui/Modal';
import { Button, Input, Select, Toggle, Card } from '@/components/ui';
import { getEffectiveDate } from '@/utils/dateUtils';
import { calculateMileage, calculateNetTipsCard } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { expenseTypes } from '@/config/defaults';

const ShiftModal = ({ isOpen, onClose, shift = null }) => {
  const { t, settings, addShift, updateShift } = useApp();
  const isEditing = !!shift;
  const isHourly = settings.workType !== 'pieceWork';
  const isDark = settings.theme !== 'light';
  
  // Form state
  const [date, setDate] = useState(getEffectiveDate());
  const [timeMode, setTimeMode] = useState('manual'); // 'manual' or 'range'
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [hasBreak, setHasBreak] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState('');
  
  // Piece-work fields
  const [ordersCount, setOrdersCount] = useState('');
  const [earnedAmount, setEarnedAmount] = useState('');
  
  // Mileage
  const [mileageMode, setMileageMode] = useState('manual');
  const [startOdometer, setStartOdometer] = useState('');
  const [endOdometer, setEndOdometer] = useState('');
  const [mileage, setMileage] = useState('');
  
  // Tips
  const [tipsCash, setTipsCash] = useState('');
  const [tipsCard, setTipsCard] = useState('');
  
  // Expenses
  const [expenses, setExpenses] = useState([]);
  const [newExpenseType, setNewExpenseType] = useState('fuel');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseComment, setNewExpenseComment] = useState('');
  
  // Bonus
  const [bonus, setBonus] = useState('');
  const [bonusComment, setBonusComment] = useState('');
  
  const [saving, setSaving] = useState(false);
  
  // Calculate time from range
  const calculateTimeFromRange = () => {
    if (!startTime || !endTime) return { hours: 0, minutes: 0 };
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    // Subtract break
    const breakMins = parseInt(breakMinutes) || 0;
    totalMinutes = Math.max(0, totalMinutes - breakMins);
    
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    };
  };
  
  // Get total minutes based on mode
  const getTotalMinutes = () => {
    if (timeMode === 'range') {
      const { hours: h, minutes: m } = calculateTimeFromRange();
      return h * 60 + m;
    }
    return (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
  };
  
  // Initialize form with shift data if editing
  useEffect(() => {
    if (shift) {
      setDate(shift.date || getEffectiveDate());
      setTimeMode(shift.timeMode || 'manual');
      setStartTime(shift.startTime || '');
      setEndTime(shift.endTime || '');
      setHours(shift.hours?.toString() || '');
      setMinutes(shift.minutes?.toString() || '');
      setHasBreak(shift.hasBreak || false);
      setBreakMinutes(shift.breakMinutes?.toString() || '');
      setOrdersCount(shift.ordersCount?.toString() || '');
      setEarnedAmount(shift.earnedAmount?.toString() || '');
      setMileageMode(shift.mileageMode || 'manual');
      setStartOdometer(shift.startOdometer?.toString() || '');
      setEndOdometer(shift.endOdometer?.toString() || '');
      setMileage(shift.mileage?.toString() || '');
      setTipsCash(shift.tipsCash?.toString() || '');
      setTipsCard(shift.tipsCard?.toString() || '');
      setExpenses(shift.expenses || []);
      setBonus(shift.bonus?.toString() || '');
      setBonusComment(shift.bonusComment || '');
    } else {
      resetForm();
    }
  }, [shift, isOpen]);
  
  const resetForm = () => {
    setDate(getEffectiveDate());
    setTimeMode('manual');
    setStartTime('');
    setEndTime('');
    setHours('');
    setMinutes('');
    setHasBreak(false);
    setBreakMinutes('');
    setOrdersCount('');
    setEarnedAmount('');
    setMileageMode('manual');
    setStartOdometer('');
    setEndOdometer('');
    setMileage('');
    setTipsCash('');
    setTipsCard('');
    setExpenses([]);
    setNewExpenseType('fuel');
    setNewExpenseAmount('');
    setNewExpenseComment('');
    setBonus('');
    setBonusComment('');
  };
  
  const calculatedMileage = mileageMode === 'odometer' 
    ? calculateMileage(startOdometer, endOdometer)
    : parseFloat(mileage) || 0;
  
  const netTipsCard = calculateNetTipsCard(parseFloat(tipsCard) || 0, settings.tipsCardPercent);
  
  const addExpense = () => {
    if (newExpenseAmount) {
      setExpenses([...expenses, {
        id: Date.now().toString(),
        type: newExpenseType,
        amount: parseFloat(newExpenseAmount),
        comment: newExpenseComment
      }]);
      setNewExpenseAmount('');
      setNewExpenseComment('');
    }
  };
  
  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };
  
  const handleSave = async () => {
    setSaving(true);
    
    const totalMinutes = getTotalMinutes();
    const calculatedTime = timeMode === 'range' ? calculateTimeFromRange() : null;
    
    const shiftData = {
      date,
      timeMode,
      startTime,
      endTime,
      hours: timeMode === 'range' ? calculatedTime.hours : (parseInt(hours) || 0),
      minutes: timeMode === 'range' ? calculatedTime.minutes : (parseInt(minutes) || 0),
      totalMinutes,
      hasBreak,
      breakMinutes: parseInt(breakMinutes) || 0,
      ordersCount: parseInt(ordersCount) || 0,
      earnedAmount: parseFloat(earnedAmount) || 0,
      mileageMode,
      startOdometer: parseFloat(startOdometer) || 0,
      endOdometer: parseFloat(endOdometer) || 0,
      mileage: calculatedMileage,
      tipsCash: parseFloat(tipsCash) || 0,
      tipsCard: parseFloat(tipsCard) || 0,
      expenses,
      bonus: parseFloat(bonus) || 0,
      bonusComment
    };
    
    try {
      if (isEditing) {
        await updateShift(shift.id, shiftData);
      } else {
        await addShift(shiftData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving shift:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const { enabledFields } = settings;
  
  const expenseTypeOptions = expenseTypes.map(type => ({
    value: type.id,
    label: `${type.icon} ${t[type.id] || type.id}`
  }));
  
  // Format calculated time for display
  const displayCalculatedTime = () => {
    if (timeMode !== 'range' || !startTime || !endTime) return null;
    const { hours: h, minutes: m } = calculateTimeFromRange();
    return `${h}${t.hoursShort || 'ч'} ${m}${t.minutesShort || 'м'}`;
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t.editShift : t.addShift}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t.cancel}
          </Button>
          <Button onClick={handleSave} loading={saving} className="flex-1">
            {t.save}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Date */}
        <div>
          <label className="block theme-text-muted text-sm mb-2">{t.date}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full theme-bg-input rounded-xl px-4 py-3 theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 box-border"
          />
        </div>
        
        {/* Work Time */}
        <Card className={`p-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="theme-text-primary font-medium">{t.workTime}</span>
          </div>
          
          {/* Time mode toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={timeMode === 'manual' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeMode('manual')}
            >
              {t.manualTime || 'Вручную'}
            </Button>
            <Button
              variant={timeMode === 'range' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeMode('range')}
            >
              {t.timeRange || 'По времени'}
            </Button>
          </div>
          
          {timeMode === 'manual' ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                label={t.hours}
                min="0"
                max="24"
              />
              <Input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                label={t.minutes}
                min="0"
                max="59"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block theme-text-muted text-sm mb-2">{t.startTime || 'Начало'}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full theme-bg-input rounded-xl px-4 py-3 theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 box-border"
                  />
                </div>
                <div>
                  <label className="block theme-text-muted text-sm mb-2">{t.endTime || 'Конец'}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full theme-bg-input rounded-xl px-4 py-3 theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 box-border"
                  />
                </div>
              </div>
              
              {/* Break */}
              <div className="mb-3">
                <Toggle
                  checked={hasBreak}
                  onChange={setHasBreak}
                  label={t.addBreak}
                />
                {hasBreak && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={breakMinutes}
                      onChange={(e) => setBreakMinutes(e.target.value)}
                      placeholder="30"
                      label={t.breakDuration || 'Перерыв (мин)'}
                      min="0"
                    />
                  </div>
                )}
              </div>
              
              {/* Show calculated time */}
              {displayCalculatedTime() && (
                <div className="text-center p-2 rounded-lg bg-purple-500/20">
                  <span className="theme-text-muted">{t.totalTime || 'Итого'}: </span>
                  <span className="text-purple-400 font-bold">{displayCalculatedTime()}</span>
                </div>
              )}
            </>
          )}
        </Card>
        
        {/* Piece-work specific fields */}
        {!isHourly && (
          <Card className={`p-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="theme-text-primary font-medium">{t.workTypePieceWork}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={ordersCount}
                onChange={(e) => setOrdersCount(e.target.value)}
                placeholder="0"
                label={t.ordersCount}
                min="0"
              />
              <Input
                type="number"
                value={earnedAmount}
                onChange={(e) => setEarnedAmount(e.target.value)}
                placeholder="0"
                label={t.earnedAmount}
                min="0"
              />
            </div>
          </Card>
        )}
        
        {/* Mileage */}
        {enabledFields.mileage && (
          <Card className={`p-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-blue-400" />
              <span className="theme-text-primary font-medium">{t.mileage}</span>
            </div>
            
            <div className="flex gap-2 mb-3">
              <Button
                variant={mileageMode === 'manual' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMileageMode('manual')}
              >
                {t.manualMileage}
              </Button>
              <Button
                variant={mileageMode === 'odometer' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMileageMode('odometer')}
              >
                {t.odometerMode}
              </Button>
            </div>
            
            {mileageMode === 'manual' ? (
              <Input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="0"
                label={t.totalMileage}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <Input
                    type="number"
                    value={startOdometer}
                    onChange={(e) => setStartOdometer(e.target.value)}
                    placeholder="0"
                    label={t.startOdometer}
                  />
                  <Input
                    type="number"
                    value={endOdometer}
                    onChange={(e) => setEndOdometer(e.target.value)}
                    placeholder="0"
                    label={t.endOdometer}
                  />
                </div>
                {calculatedMileage > 0 && (
                  <div className="text-center theme-text-secondary">
                    {t.totalMileage}: <span className="font-bold text-purple-400">{calculatedMileage} {t.km}</span>
                  </div>
                )}
              </>
            )}
          </Card>
        )}
        
        {/* Tips */}
        {(enabledFields.tipsCash || enabledFields.tipsCard) && (
          <Card className={`p-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="w-5 h-5 text-green-400" />
              <span className="theme-text-primary font-medium">{t.tips}</span>
            </div>
            
            <div className="space-y-3">
              {enabledFields.tipsCash && (
                <Input
                  type="number"
                  value={tipsCash}
                  onChange={(e) => setTipsCash(e.target.value)}
                  placeholder="0"
                  label={t.tipsCash}
                  icon={Banknote}
                />
              )}
              
              {enabledFields.tipsCard && (
                <div>
                  <Input
                    type="number"
                    value={tipsCard}
                    onChange={(e) => setTipsCard(e.target.value)}
                    placeholder="0"
                    label={t.tipsCard}
                    icon={CreditCard}
                  />
                  {parseFloat(tipsCard) > 0 && settings.tipsCardPercent > 0 && (
                    <div className="mt-2 text-sm theme-text-muted">
                      -{settings.tipsCardPercent}% → 
                      <span className="text-green-400 font-medium ml-1">
                        {formatCurrency(tipsCard, settings.currency)} ({formatCurrency(netTipsCard, settings.currency)})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* Expenses */}
        {enabledFields.expenses && (
          <Card className={`p-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-red-400" />
              <span className="theme-text-primary font-medium">{t.expenses}</span>
            </div>
            
            {/* Expense list */}
            {expenses.length > 0 && (
              <div className="space-y-2 mb-4">
                {expenses.map((expense) => {
                  const typeInfo = expenseTypes.find(et => et.id === expense.type);
                  return (
                    <div 
                      key={expense.id} 
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isDark ? 'bg-slate-600/50' : 'bg-slate-200/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{typeInfo?.icon}</span>
                        <span className="theme-text-secondary">{t[expense.type]}</span>
                        {expense.comment && (
                          <span className="theme-text-muted text-xs">({expense.comment})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-medium">
                          -{formatCurrency(expense.amount, settings.currency)}
                        </span>
                        <button
                          onClick={() => removeExpense(expense.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Add expense form */}
            <div className="space-y-2">
              <Select
                value={newExpenseType}
                onChange={(e) => setNewExpenseType(e.target.value)}
                options={expenseTypeOptions}
                label={t.expenseType}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="0"
                  label={t.amount}
                />
                <Input
                  type="text"
                  value={newExpenseComment}
                  onChange={(e) => setNewExpenseComment(e.target.value)}
                  placeholder={t.comment}
                  label={t.comment}
                />
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={addExpense}
                icon={Plus}
                fullWidth
                disabled={!newExpenseAmount}
              >
                {t.addExpense}
              </Button>
            </div>
          </Card>
        )}
        
        {/* Bonus */}
        {enabledFields.bonus && (
          <Card className={`p-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/80'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-yellow-400" />
              <span className="theme-text-primary font-medium">{t.bonus}</span>
            </div>
            
            <div className="space-y-3">
              <Input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder="0"
                label={t.amount}
              />
              <Input
                type="text"
                value={bonusComment}
                onChange={(e) => setBonusComment(e.target.value)}
                placeholder={t.comment}
                label={t.bonusComment}
              />
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default ShiftModal;
