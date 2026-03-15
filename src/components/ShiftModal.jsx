import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car, Banknote, CreditCard, Gift, Receipt, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Modal from '@/components/ui/Modal';
import { Button, Input, Select, Toggle, Card } from '@/components/ui';
import { getEffectiveDate } from '@/utils/dateUtils';
import { calculateEarnings, calculateMileage, calculateNetTipsCard } from '@/utils/calculations';
import { formatCurrency, formatTime } from '@/utils/formatters';
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
  const [errors, setErrors] = useState({});
  const [activeErrorField, setActiveErrorField] = useState('');
  const [showBonusSection, setShowBonusSection] = useState(false);

  const clearError = (field) => {
    if (activeErrorField === field) {
      setActiveErrorField('');
    }
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
      general: undefined
    }));
  };

  const getErrorText = (key, fallback) => t[key] || fallback;

  const parseNumber = (value, { integer = false } = {}) => {
    if (value === '' || value === null || value === undefined) {
      return { value: 0, empty: true, invalid: false };
    }

    const parsed = integer ? Number.parseInt(value, 10) : Number.parseFloat(value);
    return {
      value: Number.isFinite(parsed) ? parsed : 0,
      empty: false,
      invalid: !Number.isFinite(parsed)
    };
  };

  const validateFieldOnChange = (field, rawValue) => {
    let message;
    const intState = parseNumber(rawValue, { integer: true });
    const numState = parseNumber(rawValue);

    switch (field) {
      case 'hours':
        if (!intState.empty && (intState.invalid || intState.value < 0 || intState.value > 24)) {
          message = getErrorText('errorHoursInvalid', 'Hours must be between 0 and 24');
        }
        break;
      case 'minutes':
        if (!intState.empty && (intState.invalid || intState.value < 0 || intState.value > 59)) {
          message = getErrorText('errorMinutesInvalid', 'Minutes must be between 0 and 59');
        }
        break;
      case 'breakMinutes':
        if (!intState.empty && (intState.invalid || intState.value < 0)) {
          message = getErrorText('errorBreakInvalid', 'Break must be 0 or greater');
        }
        break;
      case 'ordersCount':
        if (!intState.empty && (intState.invalid || intState.value < 0)) {
          message = getErrorText('errorOrdersInvalid', 'Orders must be 0 or greater');
        }
        break;
      case 'earnedAmount':
        if (!numState.empty && (numState.invalid || numState.value <= 0)) {
          message = getErrorText('errorEarnedAmountPositive', 'Earned amount must be greater than 0');
        }
        break;
      case 'mileage':
      case 'startOdometer':
      case 'endOdometer':
        if (!numState.empty && (numState.invalid || numState.value < 0)) {
          message = getErrorText('errorMileageInvalid', 'Value must be 0 or greater');
        }
        break;
      case 'tipsCash':
      case 'tipsCard':
        if (!numState.empty && (numState.invalid || numState.value < 0)) {
          message = getErrorText('errorTipsInvalid', 'Value must be 0 or greater');
        }
        break;
      case 'bonus':
        if (!numState.empty && (numState.invalid || numState.value < 0)) {
          message = getErrorText('errorBonusInvalid', 'Bonus must be 0 or greater');
        }
        break;
      case 'newExpenseAmount':
        if (!numState.empty && (numState.invalid || numState.value <= 0)) {
          message = getErrorText('errorExpenseAmountPositive', 'Expense amount must be greater than 0');
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: message,
      general: undefined
    }));

    if (message) {
      setActiveErrorField(field);
    } else if (activeErrorField === field) {
      setActiveErrorField('');
    }
  };
  
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
    setErrors({});
    setActiveErrorField('');
    if (shift) {
      // Helper to convert value - show empty string for 0 or undefined
      const toStr = (val) => (val && val !== 0) ? val.toString() : '';
      
      setDate(shift.date || getEffectiveDate());
      setTimeMode(shift.timeMode || 'manual');
      setStartTime(shift.startTime || '');
      setEndTime(shift.endTime || '');
      setHours(toStr(shift.hours));
      setMinutes(toStr(shift.minutes));
      setHasBreak(shift.hasBreak || false);
      setBreakMinutes(toStr(shift.breakMinutes));
      setOrdersCount(toStr(shift.ordersCount));
      setEarnedAmount(toStr(shift.earnedAmount));
      setMileageMode(shift.mileageMode || 'manual');
      setStartOdometer(toStr(shift.startOdometer));
      setEndOdometer(toStr(shift.endOdometer));
      setMileage(toStr(shift.mileage));
      setTipsCash(toStr(shift.tipsCash));
      setTipsCard(toStr(shift.tipsCard));
      setExpenses(shift.expenses || []);
      setBonus(toStr(shift.bonus));
      setBonusComment(shift.bonusComment || '');
    } else {
      resetForm();
    }
  }, [shift, isOpen]);
  
  const resetForm = () => {
    setErrors({});
    setActiveErrorField('');
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
    setShowBonusSection(false);
  };
  
  const calculatedMileage = mileageMode === 'odometer' 
    ? calculateMileage(startOdometer, endOdometer)
    : parseFloat(mileage) || 0;
  
  const netTipsCard = calculateNetTipsCard(parseFloat(tipsCard) || 0, settings.tipsCardPercent);
  const previewTotalMinutes = getTotalMinutes();
  const previewBaseEarnings = isHourly
    ? calculateEarnings(previewTotalMinutes, settings, date)
    : (parseFloat(earnedAmount) || 0);
  const previewExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const previewNetIncome =
    previewBaseEarnings +
    (parseFloat(tipsCash) || 0) +
    netTipsCard +
    (parseFloat(bonus) || 0) -
    previewExpenses;
  const hasBonusContent = (parseFloat(bonus) || 0) > 0 || bonusComment.trim().length > 0;
  const workTimeHasError = Boolean(errors.totalMinutes || errors.hours || errors.minutes || errors.startTime || errors.endTime || errors.breakMinutes);
  const pieceworkHasError = Boolean(errors.ordersCount || errors.earnedAmount);
  const mileageHasError = Boolean(errors.mileage || errors.startOdometer || errors.endOdometer);
  const tipsHasError = Boolean(errors.tipsCash || errors.tipsCard);
  const expensesHasError = Boolean(errors.newExpenseAmount);
  const bonusHasError = Boolean(errors.bonus);

  useEffect(() => {
    if (!isOpen) return;

    setShowBonusSection(hasBonusContent);
  }, [isOpen, hasBonusContent]);
  
  const addExpense = () => {
    const amountState = parseNumber(newExpenseAmount);

    if (amountState.invalid || amountState.value <= 0) {
      setErrors(prev => ({
        ...prev,
        newExpenseAmount: getErrorText('errorExpenseAmountPositive', 'Expense amount must be greater than 0')
      }));
      return;
    }

    setExpenses([...expenses, {
      id: Date.now().toString(),
      type: newExpenseType,
      amount: amountState.value,
      comment: newExpenseComment.trim()
    }]);
    setNewExpenseAmount('');
    setNewExpenseComment('');
    setErrors(prev => ({
      ...prev,
      newExpenseAmount: undefined,
      general: undefined
    }));
  };
  
  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };
  
  const handleSave = async () => {
    const nextErrors = {};
    const dateValue = date?.trim();
    const hoursState = parseNumber(hours, { integer: true });
    const minutesState = parseNumber(minutes, { integer: true });
    const breakState = parseNumber(breakMinutes, { integer: true });
    const ordersState = parseNumber(ordersCount, { integer: true });
    const earnedState = parseNumber(earnedAmount);
    const mileageState = parseNumber(mileage);
    const startOdometerState = parseNumber(startOdometer);
    const endOdometerState = parseNumber(endOdometer);
    const tipsCashState = parseNumber(tipsCash);
    const tipsCardState = parseNumber(tipsCard);
    const bonusState = parseNumber(bonus);
    const calculatedTime = timeMode === 'range' ? calculateTimeFromRange() : null;
    const totalMinutes = timeMode === 'range'
      ? calculatedTime.hours * 60 + calculatedTime.minutes
      : (hoursState.value * 60 + minutesState.value);

    if (!dateValue) {
      nextErrors.date = getErrorText('errorShiftDateRequired', 'Date is required');
    }

    if (timeMode === 'manual') {
      if (hoursState.invalid || hoursState.value < 0) {
        nextErrors.hours = getErrorText('errorHoursInvalid', 'Hours must be 0 or greater');
      }
      if (minutesState.invalid || minutesState.value < 0 || minutesState.value > 59) {
        nextErrors.minutes = getErrorText('errorMinutesInvalid', 'Minutes must be between 0 and 59');
      }
    } else {
      if (!startTime) {
        nextErrors.startTime = getErrorText('errorStartTimeRequired', 'Start time is required');
      }
      if (!endTime) {
        nextErrors.endTime = getErrorText('errorEndTimeRequired', 'End time is required');
      }
      if (breakState.invalid || breakState.value < 0) {
        nextErrors.breakMinutes = getErrorText('errorBreakInvalid', 'Break must be 0 or greater');
      }
    }

    if (totalMinutes <= 0) {
      nextErrors.totalMinutes = getErrorText('errorShiftTimePositive', 'Work time must be greater than 0');
    } else if (totalMinutes > 24 * 60) {
      nextErrors.totalMinutes = getErrorText('errorShiftTimeTooLong', 'Work time cannot exceed 24 hours');
    }

    if (!isHourly) {
      if (ordersState.invalid || ordersState.value < 0) {
        nextErrors.ordersCount = getErrorText('errorOrdersInvalid', 'Orders must be 0 or greater');
      }
      if (earnedState.invalid || earnedState.value <= 0) {
        nextErrors.earnedAmount = getErrorText('errorEarnedAmountPositive', 'Earned amount must be greater than 0');
      }
    }

    if (enabledFields.mileage) {
      if (mileageMode === 'manual') {
        if (mileageState.invalid || mileageState.value < 0) {
          nextErrors.mileage = getErrorText('errorMileageInvalid', 'Mileage must be 0 or greater');
        }
      } else {
        if (startOdometerState.invalid || startOdometerState.value < 0) {
          nextErrors.startOdometer = getErrorText('errorOdometerInvalid', 'Odometer must be 0 or greater');
        }
        if (endOdometerState.invalid || endOdometerState.value < 0) {
          nextErrors.endOdometer = getErrorText('errorOdometerInvalid', 'Odometer must be 0 or greater');
        }
        if (
          !nextErrors.startOdometer &&
          !nextErrors.endOdometer &&
          endOdometerState.value < startOdometerState.value
        ) {
          nextErrors.endOdometer = getErrorText('errorOdometerOrder', 'End odometer must be greater than or equal to start odometer');
        }
      }
    }

    if (enabledFields.tipsCash && (tipsCashState.invalid || tipsCashState.value < 0)) {
      nextErrors.tipsCash = getErrorText('errorTipsInvalid', 'Value must be 0 or greater');
    }
    if (enabledFields.tipsCard && (tipsCardState.invalid || tipsCardState.value < 0)) {
      nextErrors.tipsCard = getErrorText('errorTipsInvalid', 'Value must be 0 or greater');
    }
    if (enabledFields.bonus && (bonusState.invalid || bonusState.value < 0)) {
      nextErrors.bonus = getErrorText('errorBonusInvalid', 'Bonus must be 0 or greater');
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setActiveErrorField(Object.keys(nextErrors)[0]);
      return;
    }

    setSaving(true);

    const shiftData = {
      date: dateValue,
      timeMode,
      startTime,
      endTime,
      hours: timeMode === 'range' ? calculatedTime.hours : hoursState.value,
      minutes: timeMode === 'range' ? calculatedTime.minutes : minutesState.value,
      totalMinutes,
      hasBreak,
      breakMinutes: breakState.value,
      ordersCount: ordersState.value,
      earnedAmount: earnedState.value,
      mileageMode,
      startOdometer: startOdometerState.value,
      endOdometer: endOdometerState.value,
      mileage: calculatedMileage,
      tipsCash: tipsCashState.value,
      tipsCard: tipsCardState.value,
      expenses,
      bonus: bonusState.value,
      bonusComment: bonusComment.trim()
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
      setErrors(prev => ({
        ...prev,
        general: getErrorText('errorSaveShiftFailed', 'Failed to save shift. Please try again.')
      }));
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
          <Button variant="secondary" onClick={onClose} className="flex-1 min-h-[46px]">
            {t.cancel}
          </Button>
          <Button onClick={handleSave} loading={saving} className="flex-1 min-h-[46px]">
            {t.save}
          </Button>
        </>
      }
    >
      <div className="relative space-y-6">
        <style>{`
          @keyframes fieldShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .field-shake {
            animation: fieldShake 0.22s ease-in-out 2;
          }
        `}</style>

        {/* Date */}
        <div>
          <label className="block theme-text-muted text-sm mb-2">{t.date}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              clearError('date');
            }}
                  className="w-full theme-bg-input rounded-xl px-4 py-3 theme-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] box-border"
          />
        </div>
        
        {/* Work Time */}
        <Card className={`p-4 ${getSectionClassNames(isDark, workTimeHasError)}`}>
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
                onChange={(e) => {
                  setHours(e.target.value);
                  clearError('totalMinutes');
                  validateFieldOnChange('hours', e.target.value);
                }}
                placeholder="0"
                label={t.hours}
                min="0"
                max="24"
                error={errors.hours}
                hideErrorText
                floatingError={activeErrorField === 'hours'}
                errorClassName={activeErrorField === 'hours' ? 'field-shake' : ''}
              />
              <Input
                type="number"
                value={minutes}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  clearError('totalMinutes');
                  validateFieldOnChange('minutes', e.target.value);
                }}
                placeholder="0"
                label={t.minutes}
                min="0"
                max="59"
                error={errors.minutes}
                hideErrorText
                floatingError={activeErrorField === 'minutes'}
                errorClassName={activeErrorField === 'minutes' ? 'field-shake' : ''}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="relative">
                  <label className="block theme-text-muted text-sm mb-2">{t.startTime || 'Начало'}</label>
                    {errors.startTime && activeErrorField === 'startTime' && (
                      <div className="field-shake absolute bottom-full left-3 z-20 mb-2 rounded-lg border border-red-500/30 bg-slate-950 px-2.5 py-1.5 text-xs text-red-300 shadow-lg shadow-black/30">
                        <div className="relative">
                          {errors.startTime}
                          <span className="absolute left-3 top-full h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-red-500/30 bg-slate-950" />
                        </div>
                      </div>
                    )}
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      clearError('startTime');
                      clearError('totalMinutes');
                    }}
                  className={`w-full theme-bg-input rounded-xl px-4 py-3 theme-text-primary focus:outline-none focus:ring-2 box-border ${errors.startTime ? 'border-red-500 focus:ring-red-500' : 'focus:ring-[var(--accent-primary)]'}`}
                  />
                </div>
                <div className="relative">
                  <label className="block theme-text-muted text-sm mb-2">{t.endTime || 'Конец'}</label>
                    {errors.endTime && activeErrorField === 'endTime' && (
                      <div className="field-shake absolute bottom-full left-3 z-20 mb-2 rounded-lg border border-red-500/30 bg-slate-950 px-2.5 py-1.5 text-xs text-red-300 shadow-lg shadow-black/30">
                        <div className="relative">
                          {errors.endTime}
                          <span className="absolute left-3 top-full h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-red-500/30 bg-slate-950" />
                        </div>
                      </div>
                    )}
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      clearError('endTime');
                      clearError('totalMinutes');
                    }}
                  className={`w-full theme-bg-input rounded-xl px-4 py-3 theme-text-primary focus:outline-none focus:ring-2 box-border ${errors.endTime ? 'border-red-500 focus:ring-red-500' : 'focus:ring-[var(--accent-primary)]'}`}
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
                    onChange={(e) => {
                      setBreakMinutes(e.target.value);
                      clearError('totalMinutes');
                      validateFieldOnChange('breakMinutes', e.target.value);
                    }}
                      placeholder="30"
                      label={t.breakDuration || 'Перерыв (мин)'}
                      min="0"
                      error={errors.breakMinutes}
                      hideErrorText
                    />
                  </div>
                )}
              </div>
              
              {/* Show calculated time */}
              {displayCalculatedTime() && (
                <div className={`text-center rounded-xl border p-2.5 ${isDark ? 'border-slate-700/60 bg-slate-800/55' : 'border-slate-200 bg-white/80'}`}>
                  <span className="theme-text-muted">{t.totalTime || 'Итого'}: </span>
                  <span className="text-purple-400 font-bold">{displayCalculatedTime()}</span>
                </div>
              )}
            </>
          )}
        </Card>
        
        {/* Piece-work specific fields */}
        {!isHourly && (
          <Card className={`p-4 ${getSectionClassNames(isDark, pieceworkHasError)}`}>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="theme-text-primary font-medium">{t.workTypePieceWork}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={ordersCount}
                onChange={(e) => {
                  setOrdersCount(e.target.value);
                  validateFieldOnChange('ordersCount', e.target.value);
                }}
                placeholder="0"
                label={t.ordersCount}
                min="0"
                error={errors.ordersCount}
                hideErrorText
                floatingError={activeErrorField === 'ordersCount'}
                errorClassName={activeErrorField === 'ordersCount' ? 'field-shake' : ''}
              />
              <Input
                type="number"
                value={earnedAmount}
                onChange={(e) => {
                  setEarnedAmount(e.target.value);
                  validateFieldOnChange('earnedAmount', e.target.value);
                }}
                placeholder="0"
                label={t.earnedAmount}
                min="0"
                error={errors.earnedAmount}
                hideErrorText
                floatingError={activeErrorField === 'earnedAmount'}
                errorClassName={activeErrorField === 'earnedAmount' ? 'field-shake' : ''}
              />
            </div>
          </Card>
        )}
        
        {/* Mileage */}
        {enabledFields.mileage && (
          <Card className={`p-4 ${getSectionClassNames(isDark, mileageHasError)}`}>
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-blue-400" />
              <span className="theme-text-primary font-medium">{t.mileage}</span>
            </div>
            
            <SegmentedControl
              className="mb-3"
              value={mileageMode}
              onChange={setMileageMode}
              options={[
                { value: 'manual', label: t.manualMileage },
                { value: 'odometer', label: t.odometerMode }
              ]}
            />
            
            {mileageMode === 'manual' ? (
              <Input
                type="number"
                value={mileage}
                onChange={(e) => {
                  setMileage(e.target.value);
                  validateFieldOnChange('mileage', e.target.value);
                }}
                placeholder="0"
                label={t.totalMileage}
                error={errors.mileage}
                hideErrorText
                floatingError={activeErrorField === 'mileage'}
                errorClassName={activeErrorField === 'mileage' ? 'field-shake' : ''}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <Input
                    type="number"
                    value={startOdometer}
                    onChange={(e) => {
                      setStartOdometer(e.target.value);
                      clearError('endOdometer');
                      validateFieldOnChange('startOdometer', e.target.value);
                    }}
                    placeholder="0"
                    label={t.startOdometer}
                    error={errors.startOdometer}
                    hideErrorText
                    floatingError={activeErrorField === 'startOdometer'}
                    errorClassName={activeErrorField === 'startOdometer' ? 'field-shake' : ''}
                  />
                  <Input
                    type="number"
                    value={endOdometer}
                    onChange={(e) => {
                      setEndOdometer(e.target.value);
                      validateFieldOnChange('endOdometer', e.target.value);
                    }}
                    placeholder="0"
                    label={t.endOdometer}
                    error={errors.endOdometer}
                    hideErrorText
                    floatingError={activeErrorField === 'endOdometer'}
                    errorClassName={activeErrorField === 'endOdometer' ? 'field-shake' : ''}
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
          <Card className={`p-4 ${getSectionClassNames(isDark, tipsHasError)}`}>
            <div className="mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-400" />
              <span className="theme-text-primary font-medium">{t.tips}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {enabledFields.tipsCash && (
                <Input
                  type="number"
                  value={tipsCash}
                  onChange={(e) => {
                    setTipsCash(e.target.value);
                    validateFieldOnChange('tipsCash', e.target.value);
                  }}
                  placeholder="0"
                  label={t.tipsCash}
                  icon={Banknote}
                  error={errors.tipsCash}
                  hideErrorText
                  floatingError={activeErrorField === 'tipsCash'}
                  errorClassName={activeErrorField === 'tipsCash' ? 'field-shake' : ''}
                />
              )}
              
              {enabledFields.tipsCard && (
                <div className={enabledFields.tipsCash ? '' : 'col-span-2'}>
                  <Input
                    type="number"
                    value={tipsCard}
                    onChange={(e) => {
                      setTipsCard(e.target.value);
                      validateFieldOnChange('tipsCard', e.target.value);
                    }}
                    placeholder="0"
                    label={t.tipsCard}
                    icon={CreditCard}
                    error={errors.tipsCard}
                    hideErrorText
                    floatingError={activeErrorField === 'tipsCard'}
                    errorClassName={activeErrorField === 'tipsCard' ? 'field-shake' : ''}
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
          <Card className={`p-4 ${getSectionClassNames(isDark, expensesHasError)}`}>
            <div className="mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-400" />
              <span className="theme-text-primary font-medium">{t.expenses}</span>
              {previewExpenses > 0 && (
                <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-slate-800/75 text-slate-200' : 'bg-white/85 text-slate-700'}`}>
                  {formatCurrency(previewExpenses, settings.currency)}
                </span>
              )}
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => {
                    setNewExpenseAmount(e.target.value);
                    validateFieldOnChange('newExpenseAmount', e.target.value);
                  }}
                  placeholder="0"
                  label={t.amount}
                  error={errors.newExpenseAmount}
                  hideErrorText
                  floatingError={activeErrorField === 'newExpenseAmount'}
                  errorClassName={activeErrorField === 'newExpenseAmount' ? 'field-shake' : ''}
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
          <CollapsibleCard
            title={t.bonus}
            icon={Gift}
            iconClassName="text-yellow-400"
            isDark={isDark}
            isOpen={showBonusSection}
            onToggle={() => setShowBonusSection(prev => !prev)}
            hasError={bonusHasError}
            badge={(parseFloat(bonus) || 0) > 0 ? formatCurrency(parseFloat(bonus) || 0, settings.currency) : null}
          >
            <div className="space-y-3">
              <Input
                type="number"
                value={bonus}
                onChange={(e) => {
                  setBonus(e.target.value);
                  validateFieldOnChange('bonus', e.target.value);
                }}
                placeholder="0"
                label={t.amount}
                error={errors.bonus}
                hideErrorText
                floatingError={activeErrorField === 'bonus'}
                errorClassName={activeErrorField === 'bonus' ? 'field-shake' : ''}
              />
              <Input
                type="text"
                value={bonusComment}
                onChange={(e) => setBonusComment(e.target.value)}
                placeholder={t.comment}
                label={t.bonusComment}
              />
            </div>
          </CollapsibleCard>
        )}

        <Card className={`p-4 ${isDark ? 'bg-slate-800/45' : 'bg-white/85 border border-slate-200'}`}>
          <div className="mb-3 flex items-center justify-between">
            <span className="theme-text-primary text-base font-bold">
              {settings.language === 'ru' && 'Сводка'}
              {settings.language === 'en' && 'Summary'}
              {settings.language === 'he' && 'סיכום'}
            </span>
            <span className="theme-text-muted text-xs">
              {formatDateLabel(date, t, settings.language)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                {t.totalTime || 'Total time'}
              </div>
              <div className="theme-text-primary text-sm font-bold">
                {formatTime(previewTotalMinutes)}
              </div>
            </div>
            <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                {isHourly ? (t.earnings || t.totalEarnings) : t.earnedAmount}
              </div>
              <div className="text-green-400 text-sm font-bold">
                {formatCurrency(previewBaseEarnings, settings.currency)}
              </div>
            </div>
            <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <div className="mb-1 theme-text-muted text-[11px] uppercase tracking-[0.14em]">
                {t.netIncome}
              </div>
              <div className="text-purple-400 text-sm font-bold">
                {formatCurrency(previewNetIncome, settings.currency)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

const formatDateLabel = (dateValue, t, language) => {
  if (!dateValue) {
    return t.date;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(language || 'ru', {
    day: 'numeric',
    month: 'short'
  }).format(date);
};

const getSectionClassNames = (isDark, hasError = false) => {
  if (hasError) {
    return isDark
      ? 'bg-slate-700/30 ring-1 ring-red-500/40'
      : 'bg-slate-100/80 ring-1 ring-red-400/40';
  }

  return isDark ? 'bg-slate-700/30' : 'bg-slate-100/80';
};

const SegmentedControl = ({ value, onChange, options, className = '' }) => (
  <div className={`grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/45 p-1 ${className}`}>
    {options.map((option) => {
      const isActive = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            isActive
              ? 'bg-sky-500 text-white shadow-[0_10px_20px_rgba(14,165,233,0.18)]'
              : 'text-slate-300 hover:bg-slate-800/70'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const CollapsibleCard = ({
  title,
  icon: Icon,
  iconClassName,
  isDark,
  isOpen,
  onToggle,
  children,
  badge,
  hasError = false
}) => (
  <Card className={`overflow-hidden ${getSectionClassNames(isDark, hasError)}`}>
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 p-4 text-left"
    >
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className={`h-5 w-5 ${iconClassName}`} />}
        <span className="theme-text-primary font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-slate-800/75 text-slate-200' : 'bg-white/85 text-slate-700'}`}>
            {badge}
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 theme-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 theme-text-muted" />
        )}
      </div>
    </button>
    {isOpen && (
      <div className="px-4 pb-4 animate-fade-in">
        {children}
      </div>
    )}
  </Card>
);

export default ShiftModal;
