import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, DollarSign, Banknote, CreditCard, Car, Receipt, Gift, 
  TrendingUp, Calendar, BarChart3, Package, ChevronDown, ChevronUp, List, Settings,
  Download, FileSpreadsheet, X, Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, EmptyState } from '@/components/ui';
import { getDateRange, isDateInRange, formatDate } from '@/utils/dateUtils';
import { calculateStatistics, calculateShiftBaseEarnings } from '@/utils/calculations';
import { formatCurrency, formatTime, formatTimeLabeled } from '@/utils/formatters';

const StatCard = ({ icon: Icon, label, value, color = 'theme-text-primary', subValue }) => (
  <Card className="p-3.5">
    <div className="flex items-center gap-2 mb-1.5">
      {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      <span className="theme-text-muted text-[11px] uppercase tracking-[0.14em]">{label}</span>
    </div>
    <div className={`font-bold text-lg tracking-tight ${color}`}>
      {value}
    </div>
    {subValue && (
      <div className="theme-text-muted text-xs mt-1">{subValue}</div>
    )}
  </Card>
);

const ExpenseBreakdown = ({ expensesByType, currency, t, isDark }) => {
  if (Object.keys(expensesByType).length === 0) return null;
  
  const total = Object.values(expensesByType).reduce((sum, val) => sum + val, 0);
  
  return (
    <Card className="p-4">
      <h3 className="theme-text-primary text-base font-bold mb-3 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-red-400" />
        {t.expenseDetails}
      </h3>
      <div className="space-y-3">
        {Object.entries(expensesByType)
          .sort(([, a], [, b]) => b - a)
          .map(([type, amount]) => {
            const percentage = (amount / total * 100).toFixed(0);
            return (
              <div key={type}>
                <div className="flex justify-between items-center mb-1">
                  <span className="theme-text-secondary">{t[type] || type}</span>
                  <span className="text-red-400 font-medium">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </Card>
  );
};

const StatisticsScreen = () => {
  const { t, shifts, settings } = useApp();
  const { enabledFields, currency, statisticsFields } = settings;
  const sf = statisticsFields || {}; // Safe access
  const isHourly = settings.workType !== 'pieceWork';
  const isDark = settings.theme !== 'light';
  
  // Calculate previous FULL month (e.g., in January 2026 show December 1-31, 2025)
  const getPrevMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed, so January = 0
    
    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    
    // First day of previous month
    const firstDay = new Date(prevYear, prevMonth, 1);
    // Last day of previous month
    const lastDay = new Date(prevYear, prevMonth + 1, 0);
    
    // Format as YYYY-MM-DD without timezone issues
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    return {
      from: formatDate(firstDay),
      to: formatDate(lastDay)
    };
  };
  
  const prevMonth = getPrevMonthDates();
  const [period, setPeriod] = useState('thisMonth');
  const [customFrom, setCustomFrom] = useState(prevMonth.from);
  const [customTo, setCustomTo] = useState(prevMonth.to);

  const activeDateRange = useMemo(() => getDateRange(period, customFrom, customTo), [period, customFrom, customTo]);
  
  // Filter shifts based on selected period
  const filteredShifts = useMemo(() => {
    const { startDate, endDate } = activeDateRange;
    return shifts.filter(shift => isDateInRange(shift.date, startDate, endDate));
  }, [shifts, activeDateRange]);
  
  // Calculate statistics - key includes period to force recalculation
  const stats = useMemo(() => {
    return calculateStatistics(filteredShifts, settings);
  }, [filteredShifts, settings, period, customFrom, customTo]);
  
  const periodButtons = [
    { id: 'today', label: t.today },
    { id: 'thisWeek', label: t.thisWeek },
    { id: 'thisMonth', label: t.thisMonth },
    { id: 'custom', label: t.custom }
  ];
  
  const formatTipsCardValue = () => {
    if (settings.tipsCardPercent > 0 && stats.totalTipsCardGross > 0) {
      const gross = formatCurrency(stats.totalTipsCardGross, currency);
      const net = formatCurrency(stats.totalTipsCard, currency);
      return `${gross} (${net})`;
    }
    return formatCurrency(stats.totalTipsCard, currency);
  };

  const activeRangeLabel = useMemo(() => {
    const from = formatDate(activeDateRange.startDate, settings.language);
    const to = formatDate(activeDateRange.endDate, settings.language);
    return from === to ? from : `${from} - ${to}`;
  }, [activeDateRange, settings.language]);

  const periodHelperText = useMemo(() => {
    if (settings.language === 'ru') {
      return `${filteredShifts.length} смен за выбранный период`;
    }

    if (settings.language === 'he') {
      return `${filteredShifts.length} משמרות לתקופה שנבחרה`;
    }

    return `${filteredShifts.length} shifts in the selected period`;
  }, [filteredShifts.length, settings.language]);
  
  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold theme-text-primary">{t.statistics}</h1>
      </div>
      
      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <label className="block theme-text-muted text-[11px] uppercase tracking-[0.18em]">{t.selectPeriod}</label>
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-sky-500/10 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-3">
          {periodButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriod(btn.id)}
              className={`py-2.5 px-2 rounded-2xl text-xs font-semibold transition-all ${
                period === btn.id
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_12px_24px_rgba(14,165,233,0.24)]'
                  : isDark 
                    ? 'bg-slate-800/65 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        
        {period === 'custom' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block theme-text-muted text-xs mb-1">{t.from}</label>
              <input 
                type="date" 
                value={customFrom} 
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full theme-bg-input rounded-2xl px-3 py-2.5 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex-1">
              <label className="block theme-text-muted text-xs mb-1">{t.to}</label>
              <input 
                type="date" 
                value={customTo} 
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full theme-bg-input rounded-2xl px-3 py-2.5 theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}

        <div className={`mt-4 flex flex-col gap-2 rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700/50 bg-slate-900/55' : 'border-slate-200 bg-slate-50/90'}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="theme-text-muted text-[11px] uppercase tracking-[0.16em]">
              {settings.language === 'ru' && 'Активный диапазон'}
              {settings.language === 'en' && 'Active range'}
              {settings.language === 'he' && 'טווח פעיל'}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-sky-500/10 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
              {periodButtons.find(btn => btn.id === period)?.label}
            </span>
          </div>
          <div className="theme-text-primary text-sm font-semibold">
            {activeRangeLabel}
          </div>
          <div className="theme-text-muted text-sm">
            {periodHelperText}
          </div>
        </div>
      </Card>
      
      {filteredShifts.length === 0 ? (
        <EmptyState icon={BarChart3} title={t.noData} />
      ) : (
        <div className="space-y-4" key={`${period}-${customFrom}-${customTo}`}>
          {/* Net income header */}
          <div className={`rounded-[26px] p-5 border overflow-hidden relative ${
            isDark
              ? 'bg-[linear-gradient(145deg,rgba(8,23,39,0.94),rgba(18,42,72,0.92))] border-sky-400/20'
              : 'bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(235,244,252,0.92))] border-sky-200/80'
          }`}>
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-400/12 blur-2xl" />
            <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-sky-500/12 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">{t.netIncome}</div>
                <span className="theme-text-secondary text-sm">{stats.shiftsCount} {t.shiftsCount}</span>
              </div>
            </div>
            <div className="text-3xl font-bold theme-text-primary mb-2 tracking-tight">
              {formatCurrency(stats.netIncome, currency)}
            </div>
            <div className="theme-text-muted text-sm">
              {stats.shiftsCount} {t.shiftsCount} • {formatTimeLabeled(stats.totalMinutes, t)}
            </div>
          </div>
          
          {/* Stats grid - filtered by settings */}
          <div className="grid grid-cols-2 gap-2.5">
            {sf.totalHours !== false && (
              <StatCard 
                icon={Clock} 
                label={t.totalHours} 
                value={formatTime(stats.totalMinutes)} 
                subValue={`${stats.shiftsCount} ${t.shiftsCount}`} 
              />
            )}
            
            {sf.totalEarnings !== false && (
              <StatCard 
                icon={DollarSign} 
                label={isHourly ? t.totalEarnings : t.earnedAmount} 
                value={formatCurrency(stats.totalEarnings, currency)} 
                color="text-green-400" 
              />
            )}
            
            {sf.avgPerHour !== false && (
              <StatCard 
                icon={TrendingUp} 
                label={t.avgPerHour} 
                value={formatCurrency(stats.avgPerHour, currency)} 
                color="text-purple-400" 
              />
            )}
            
            {!isHourly && stats.totalOrders > 0 && (
              <StatCard 
                icon={Package} 
                label={t.orders} 
                value={stats.totalOrders} 
                color="text-blue-400" 
              />
            )}
            
            {sf.tipsCash !== false && enabledFields.tipsCash && stats.totalTipsCash > 0 && (
              <StatCard 
                icon={Banknote} 
                label={t.totalTipsCash} 
                value={formatCurrency(stats.totalTipsCash, currency)} 
                color="text-green-400" 
              />
            )}
            
            {sf.tipsCard !== false && enabledFields.tipsCard && stats.totalTipsCard > 0 && (
              <StatCard 
                icon={CreditCard} 
                label={t.totalTipsCard} 
                value={formatTipsCardValue()} 
                color="text-green-400" 
                subValue={settings.tipsCardPercent > 0 ? `${t.deduction}: ${settings.tipsCardPercent}%` : undefined} 
              />
            )}
            
            {sf.mileage !== false && enabledFields.mileage && stats.totalMileage > 0 && (
              <StatCard 
                icon={Car} 
                label={t.totalMileageStats} 
                value={`${stats.totalMileage} ${t.km}`} 
              />
            )}
            
            {sf.expenses !== false && enabledFields.expenses && stats.totalExpenses > 0 && (
              <StatCard 
                icon={Receipt} 
                label={t.totalExpenses} 
                value={formatCurrency(stats.totalExpenses, currency)} 
                color="text-red-400" 
              />
            )}
            
            {enabledFields.bonus && stats.totalBonus > 0 && (
              <StatCard 
                icon={Gift} 
                label={t.totalBonus} 
                value={formatCurrency(stats.totalBonus, currency)} 
                color="text-yellow-400" 
              />
            )}
            
            {sf.avgHoursPerShift !== false && (
              <StatCard 
                icon={Calendar} 
                label={t.avgHoursPerShift} 
                value={formatTime(stats.avgMinutesPerShift)} 
              />
            )}
            
            {sf.avgIncomePerShift !== false && (
              <StatCard 
                icon={TrendingUp} 
                label={t.avgIncomePerShift} 
                value={formatCurrency(stats.avgIncomePerShift, currency)} 
                color="text-purple-400" 
              />
            )}
          </div>
          
          {sf.expenseDetails !== false && enabledFields.expenses && (
            <ExpenseBreakdown expensesByType={stats.expensesByType} currency={currency} t={t} isDark={isDark} />
          )}
          
          {/* Bonus comments */}
          {enabledFields.bonus && stats.bonusComments && stats.bonusComments.length > 0 && (
            <CommentsSection 
              title={t.bonusComments || 'Комментарии к бонусам'} 
              comments={stats.bonusComments} 
              icon="gift"
              color="text-yellow-400"
              isDark={isDark} 
              t={t}
              currency={currency}
              language={settings.language}
            />
          )}
          
          {/* Expense comments */}
          {enabledFields.expenses && stats.expenseComments && stats.expenseComments.length > 0 && (
            <CommentsSection 
              title={t.expenseComments || 'Комментарии к затратам'} 
              comments={stats.expenseComments} 
              icon="receipt"
              color="text-red-400"
              isDark={isDark} 
              t={t}
              currency={currency}
              language={settings.language}
            />
          )}
          
          {/* Shifts list for selected period */}
          <ShiftsList shifts={filteredShifts} settings={settings} t={t} isDark={isDark} />
          
          {/* Export button */}
          <ExportButton 
            shifts={filteredShifts} 
            settings={settings} 
            t={t} 
            isDark={isDark}
            dateFrom={customFrom}
            dateTo={customTo}
          />
        </div>
      )}
    </div>
  );
};

// Export to Excel modal and button
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
  const { enabledFields, workType, currency } = settings;
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
  
  // Filter available columns based on settings
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
    if (fieldId === 'date') return; // Date is required
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };
  
  const selectAll = () => {
    setSelectedFields(availableColumns.map(c => c.id));
  };
  
  const selectNone = () => {
    setSelectedFields(['date']);
  };
  
  const exportToExcel = async () => {
    if (shifts.length === 0) return;
    
    // Dynamic import of xlsx
    const XLSX = await import('xlsx');
    
    // Prepare data
    const data = shifts
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(shift => {
        const row = {};
        const baseEarnings = calculateShiftBaseEarnings(shift, settings);
        const totalExpenses = shift.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        
        selectedFields.forEach(fieldId => {
          const label = t[fieldId] || fieldId;
          switch (fieldId) {
            case 'date':
              row[label] = shift.date;
              break;
            case 'hours':
              row[label] = shift.totalMinutes ? (shift.totalMinutes / 60).toFixed(2) : 0;
              break;
            case 'earnings':
              row[label] = baseEarnings;
              break;
            case 'earnedAmount':
              row[label] = shift.earnedAmount || 0;
              break;
            case 'tipsCash':
              row[label] = shift.tipsCash || 0;
              break;
            case 'tipsCard':
              row[label] = shift.tipsCard || 0;
              break;
            case 'mileage':
              row[label] = shift.mileage || 0;
              break;
            case 'expenses':
              row[label] = totalExpenses;
              break;
            case 'bonus':
              row[label] = shift.bonus || 0;
              break;
            case 'bonusComment':
              row[label] = shift.bonusComment || '';
              break;
            case 'orders':
              row[label] = shift.ordersCount || 0;
              break;
          }
        });
        return row;
      });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Auto-width columns
    const colWidths = selectedFields.map(fieldId => {
      const label = t[fieldId] || fieldId;
      return { wch: Math.max(label.length + 2, 12) };
    });
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Shifts');
    
    // Generate filename
    const fromStr = dateFrom || 'start';
    const toStr = dateTo || 'end';
    const filename = `shifts_${fromStr}_${toStr}.xlsx`;
    
    // Download
    XLSX.writeFile(wb, filename);
    setShowModal(false);
  };
  
  if (shifts.length === 0) return null;
  
  return (
    <>
      <Card className="p-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:brightness-105 transition-all shadow-[0_16px_30px_rgba(16,185,129,0.22)]"
        >
          <Download className="w-5 h-5" />
          {t.exportToExcel || 'Выгрузить в Excel'}
        </button>
      </Card>
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[30px] p-6 border ${isDark ? 'bg-slate-900/95 border-slate-700/60' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="theme-text-primary font-semibold text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-500" />
                {t.exportToExcel || 'Выгрузить в Excel'}
              </h3>
              <button onClick={() => setShowModal(false)} className="theme-text-muted hover:theme-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="theme-text-muted text-sm mb-4">
              {t.selectFieldsToExport || 'Выберите поля для выгрузки'}
            </p>
            
            {/* Quick actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={selectAll}
                className="text-xs px-3 py-1.5 rounded-xl bg-sky-500/16 text-sky-300 hover:bg-sky-500/24"
              >
                {t.selectAll || 'Выбрать все'}
              </button>
              <button
                onClick={selectNone}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
              >
                {t.clearSelection || 'Очистить'}
              </button>
            </div>
            
            {/* Field selection */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto mb-6">
              {availableColumns.map(col => {
                const isSelected = selectedFields.includes(col.id);
                const isRequired = col.required;
                return (
                  <button
                    key={col.id}
                    onClick={() => toggleField(col.id)}
                    disabled={isRequired}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/16 text-emerald-300 border border-emerald-500/20'
                        : isDark 
                          ? 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    } ${isRequired ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span>{t[col.label] || col.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
            
            {/* Export button */}
            <button
              onClick={exportToExcel}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:brightness-105 transition-all shadow-[0_16px_30px_rgba(16,185,129,0.22)]"
            >
              <Download className="w-5 h-5" />
              {t.export || 'Выгрузить'} ({shifts.length} {t.shiftsCount || 'смен'})
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Comments section (for bonus and expenses)
const CommentsSection = ({ title, comments, icon, color, isDark, t, currency, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const IconComponent = icon === 'gift' ? Gift : Receipt;
  
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${color}`} />
          <span className="theme-text-primary font-semibold">{title}</span>
          <span className="theme-text-muted text-sm">({comments.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 theme-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 theme-text-muted" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-slate-700/30 px-4 py-2">
          {comments.map((item, idx) => (
            <div 
              key={idx}
              className={`py-2 flex justify-between items-start border-b last:border-b-0 ${
                isDark ? 'border-slate-700/30' : 'border-slate-200'
              }`}
            >
              <div className="flex-1">
                <div className="theme-text-muted text-xs">{formatDate(item.date, language || 'ru')}</div>
                <div className="theme-text-secondary text-sm">{item.comment}</div>
              </div>
              <span className={`${color} font-medium text-sm ml-2`}>
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Available columns for shifts list
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

// Collapsible shifts list with column selector
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
  
  // Filter available columns based on enabled fields
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
  
  // Sort by date descending
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
      case 'tipsCash': return shift.tipsCash ? formatCurrency(shift.tipsCash, currency) : '-';
      case 'tipsCard': return shift.tipsCard ? formatCurrency(shift.tipsCard, currency) : '-';
      case 'mileage': return shift.mileage ? `${shift.mileage} ${t.km || 'км'}` : '-';
      case 'expenses': return totalExpenses > 0 ? formatCurrency(totalExpenses, currency) : '-';
      case 'bonus': return shift.bonus ? formatCurrency(shift.bonus, currency) : '-';
      case 'orders': return shift.ordersCount || '-';
      default: return '-';
    }
  };
  
  const getColumnColor = (colId) => {
    switch (colId) {
      case 'earnings': return 'text-green-400';
      case 'earnedAmount': return 'text-blue-400';
      case 'tipsCash': return 'text-emerald-400';
      case 'tipsCard': return 'text-blue-400';
      case 'expenses': return 'text-red-400';
      case 'bonus': return 'text-yellow-400';
      default: return 'theme-text-secondary';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-blue-400" />
          <span className="theme-text-primary font-semibold">
            {t.showShiftsList || 'Список смен'}
          </span>
          <span className="theme-text-muted text-sm">({shifts.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 theme-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 theme-text-muted" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-slate-700/30">
          {/* Column selector toggle */}
          <div className={`px-4 py-2 border-b ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
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
                          ? 'bg-sky-500/16 text-sky-300 border border-sky-500/20'
                          : isDark 
                            ? 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t[col.label] || col.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Scrollable table container */}
          <div className="overflow-x-auto">
            {/* Header row */}
            <div className={`flex text-xs font-medium theme-text-muted border-b sticky top-0 ${
              isDark ? 'border-slate-700/30 bg-[#0f172a]' : 'border-slate-200 bg-white'
            }`}>
              <div className={`flex-shrink-0 w-[100px] px-4 py-2 sticky left-0 z-10 ${
                isDark ? 'bg-[#0f172a]' : 'bg-white'
              }`} style={{ boxShadow: '4px 0 8px rgba(0,0,0,0.3)' }}>
                {t.date || 'Дата'}
              </div>
              {selectedColumns.map(colId => {
                const col = SHIFT_COLUMNS.find(c => c.id === colId);
                return (
                  <span key={colId} className="min-w-[80px] px-3 py-2 text-right flex-shrink-0">
                    {t[col?.label] || col?.label}
                  </span>
                );
              })}
            </div>
            
            {/* Data rows */}
            {sortedShifts.map((shift) => (
              <div 
                key={shift.id}
                className={`flex border-b last:border-b-0 ${
                  isDark ? 'border-slate-700/30' : 'border-slate-200'
                }`}
              >
                <div className={`flex-shrink-0 w-[100px] px-4 py-3 theme-text-secondary text-sm sticky left-0 z-10 ${
                  isDark ? 'bg-[#0f172a]' : 'bg-white'
                }`} style={{ boxShadow: '4px 0 8px rgba(0,0,0,0.3)' }}>
                  {formatDate(shift.date, settings.language)}
                </div>
                {selectedColumns.map(colId => (
                  <span 
                    key={colId} 
                    className={`text-sm font-medium min-w-[80px] px-3 py-3 text-right flex-shrink-0 ${getColumnColor(colId)}`}
                  >
                    {getColumnValue(shift, colId)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatisticsScreen;
