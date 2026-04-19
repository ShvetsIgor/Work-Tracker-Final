import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car, Banknote, CreditCard, Receipt, Package, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Modal from '@/components/ui/Modal';
import { Button, Input, Select, Toggle, Card } from '@/components/ui';
import { getEffectiveDate } from '@/utils/dateUtils';
import { calculateEarnings, calculateNetTipsCard } from '@/utils/calculations';
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

  // Mileage (manual only)
  const [mileage, setMileage] = useState('');

  // Tips
  const [tipsCash, setTipsCash] = useState('');
  const [tipsCard, setTipsCard] = useState('');

  // Expenses
  const [expenses, setExpenses] = useState([]);
  const [newExpenseType, setNewExpenseType] = useState('fuel');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseComment, setNewExpenseComment] = useState('');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeErrorField, setActiveErrorField] = useState('');

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

    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    const breakMins = parseInt(breakMinutes) || 0;
    totalMinutes = Math.max(0, totalMinutes - breakMins);

    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    };
  };

  const getTotalMinutes = () => {
    if (timeMode === 'range') {
      const { hours: h, minutes: m } = calculateTimeFromRange();
      return h * 60 + m;
    }
    return (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
  };

  useEffect(() => {
    setErrors({});
    setActiveErrorField('');
    if (shift) {
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
      setMileage(toStr(shift.mileage));
      setTipsCash(toStr(shift.tipsCash));
      setTipsCard(toStr(shift.tipsCard));
      setExpenses(shift.expenses || []);
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
    setMileage('');
    setTipsCash('');
    setTipsCard('');
    setExpenses([]);
    setNewExpenseType('fuel');
    setNewExpenseAmount('');
    setNewExpenseComment('');
  };

  const calculatedMileage = parseFloat(mileage) || 0;

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
    (shift?.bonus || 0) -
    previewExpenses;

  const workTimeHasError = Boolean(errors.totalMinutes || errors.hours || errors.minutes || errors.startTime || errors.endTime || errors.breakMinutes);
  const pieceworkHasError = Boolean(errors.ordersCount || errors.earnedAmount);
  const mileageHasError = Boolean(errors.mileage);
  const tipsHasError = Boolean(errors.tipsCash || errors.tipsCard);
  const expensesHasError = Boolean(errors.newExpenseAmount);

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
    const tipsCashState = parseNumber(tipsCash);
    const tipsCardState = parseNumber(tipsCard);
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

    if (enabledFields.mileage && (mileageState.invalid || mileageState.value < 0)) {
      nextErrors.mileage = getErrorText('errorMileageInvalid', 'Mileage must be 0 or greater');
    }

    if (enabledFields.tipsCash && (tipsCashState.invalid || tipsCashState.value < 0)) {
      nextErrors.tipsCash = getErrorText('errorTipsInvalid', 'Value must be 0 or greater');
    }
    if (enabledFields.tipsCard && (tipsCardState.invalid || tipsCardState.value < 0)) {
      nextErrors.tipsCard = getErrorText('errorTipsInvalid', 'Value must be 0 or greater');
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
      mileageMode: 'manual',
      startOdometer: shift?.startOdometer || 0,
      endOdometer: shift?.endOdometer || 0,
      mileage: calculatedMileage,
      tipsCash: tipsCashState.value,
      tipsCard: tipsCardState.value,
      expenses,
      bonus: shift?.bonus || 0,
      bonusComment: shift?.bonusComment || ''
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
          <Button variant="secondary" onClick={onClose} className="flex-1 min-h-[42px]">
            {t.cancel}
          </Button>
          <Button onClick={handleSave} loading={saving} className="flex-1 min-h-[42px]">
            {t.save}
          </Button>
        </>
      }
    >
      <div className="relative">
        <style>{`
          @keyframes fieldShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .field-shake {
            animation: fieldShake 0.22s ease-in-out 2;
          }
          .shift-form-shell {
            overflow: hidden;
            border-radius: 20px;
          }
          .shift-form-shell > .shift-form-section {
            margin-top: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          .shift-form-shell > .shift-form-section + .shift-form-section {
            border-top: 1px solid rgba(255,255,255,0.05);
          }
        `}</style>

        {/* Hero total — сверху, чтобы видеть итог сразу */}
        <HeroTotal
          isDark={isDark}
          netIncome={previewNetIncome}
          baseEarnings={previewBaseEarnings}
          totalMinutes={previewTotalMinutes}
          currency={settings.currency}
          hourlyRate={settings.hourlyRate}
          isHourly={isHourly}
          dateLabel={formatDateLabel(date, t, settings.language)}
          t={t}
        />

        <div className={`mt-4 shift-form-shell ${isDark ? 'border border-white/[0.05] bg-slate-800/38' : 'border border-slate-200 bg-white/90'}`}>
          {/* Date */}
          <div className="px-4 py-3">
            <SectionLabel icon={Clock}>{t.date}</SectionLabel>
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
          <Card className={`shift-form-section p-3.5 ${getSectionClassNames(isDark, workTimeHasError)}`}>
            <SectionLabel icon={Clock} className="mb-3">{t.workTime}</SectionLabel>

            <div className="mb-3 flex gap-2">
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
              <div className="grid grid-cols-2 gap-2.5">
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
                <div className="mb-2.5 grid grid-cols-2 gap-2.5">
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

                <div className="mb-2.5">
                  <Toggle
                    checked={hasBreak}
                    onChange={setHasBreak}
                    label={t.addBreak}
                  />
                  {hasBreak && (
                    <div className="mt-1.5">
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

                {displayCalculatedTime() && (
                  <div className={`rounded-lg border p-2 text-center ${isDark ? 'border-slate-700/60 bg-slate-800/55' : 'border-slate-200 bg-white/80'}`}>
                    <span className="theme-text-muted">{t.totalTime || 'Итого'}: </span>
                    <span className="text-purple-400 font-bold">{displayCalculatedTime()}</span>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Piece-work specific fields */}
          {!isHourly && (
            <Card className={`shift-form-section p-3.5 ${getSectionClassNames(isDark, pieceworkHasError)}`}>
              <SectionLabel icon={Package} className="mb-3">{t.workTypePieceWork}</SectionLabel>

              <div className="grid grid-cols-2 gap-2.5">
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

          {/* Mileage — manual only */}
          {enabledFields.mileage && (
            <Card className={`shift-form-section p-3.5 ${getSectionClassNames(isDark, mileageHasError)}`}>
              <SectionLabel icon={Car} className="mb-3">{t.mileage}</SectionLabel>

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
            </Card>
          )}

          {/* Tips */}
          {(enabledFields.tipsCash || enabledFields.tipsCard) && (
            <Card className={`shift-form-section p-3.5 ${getSectionClassNames(isDark, tipsHasError)}`}>
              <SectionLabel icon={Banknote} iconClassName="text-green-400" className="mb-3">{t.tips}</SectionLabel>

              <div className="grid grid-cols-2 gap-2.5">
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
                      <div className="mt-1.5 text-xs theme-text-muted">
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
            <Card className={`shift-form-section p-3.5 ${getSectionClassNames(isDark, expensesHasError)}`}>
              <div className="mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-red-400" />
                <span className="theme-text-muted text-[11px] uppercase tracking-[0.14em] font-semibold">{t.expenses}</span>
                {previewExpenses > 0 && (
                  <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-slate-800/75 text-slate-200' : 'bg-white/85 text-slate-700'}`}>
                    {formatCurrency(previewExpenses, settings.currency)}
                  </span>
                )}
              </div>

              {expenses.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {expenses.map((expense) => {
                    const typeInfo = expenseTypes.find(et => et.id === expense.type);
                    return (
                      <div
                        key={expense.id}
                        className={`flex items-center justify-between rounded-lg p-2 ${
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

              <div className="space-y-1.5">
                <Select
                  value={newExpenseType}
                  onChange={(e) => setNewExpenseType(e.target.value)}
                  options={expenseTypeOptions}
                  label={t.expenseType}
                />
                <div className="grid grid-cols-[104px,minmax(0,1fr),44px] items-end gap-2">
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={addExpense}
                    icon={Plus}
                    className="h-[42px] w-11 self-end px-0"
                    disabled={!newExpenseAmount}
                    title={t.addExpense}
                    aria-label={t.addExpense}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Modal>
  );
};

const SectionLabel = ({ icon: Icon, iconClassName = 'text-blue-400', children, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {Icon && <Icon className={`w-4 h-4 ${iconClassName}`} />}
    <span className="theme-text-muted text-[11px] uppercase tracking-[0.14em] font-semibold">{children}</span>
  </div>
);

const HeroTotal = ({ isDark, netIncome, baseEarnings, totalMinutes, currency, hourlyRate, isHourly, dateLabel, t }) => {
  const netColor = netIncome >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`rounded-2xl px-4 py-4 ${isDark ? 'border border-white/[0.05] bg-slate-800/55' : 'border border-slate-200 bg-white'}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="theme-text-muted text-[11px] uppercase tracking-[0.14em] font-semibold">
          {t.netIncome || 'Итого'}
          {isHourly && hourlyRate ? ` · ${formatCurrency(hourlyRate, currency)}/${t.hoursShort || 'ч'}` : ''}
        </span>
        <span className="theme-text-muted text-[11px]">{dateLabel}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-[28px] font-bold leading-none ${netColor}`}>
            {formatCurrency(netIncome, currency)}
          </div>
          <div className="mt-1 theme-text-muted text-xs">
            {isHourly ? (t.earnings || t.totalEarnings) : t.earnedAmount}: <span className="theme-text-secondary font-medium">{formatCurrency(baseEarnings, currency)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="theme-text-muted text-[11px] uppercase tracking-[0.14em]">
            {t.totalTime || 'Время'}
          </div>
          <div className="theme-text-primary text-lg font-bold">
            {formatTime(totalMinutes)}
          </div>
        </div>
      </div>
    </div>
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

export default ShiftModal;
