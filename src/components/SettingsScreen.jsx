import React, { useEffect, useRef, useState } from 'react';
import {
  Globe,
  Utensils,
  CreditCard,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Briefcase,
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader,
  Palette
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, Input, Select, Toggle } from '@/components/ui';
import { currencies } from '@/config/currencies';
import { paletteOrder } from '@/config/colorPalettes';

const SettingRow = ({ children, noBorder = false }) => (
  <div className={`py-3.5 ${!noBorder ? 'border-b border-slate-700/50 dark:border-slate-700/50' : ''}`}>
    {children}
  </div>
);

const CollapsibleSection = ({ title, icon: Icon, iconColor, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { settings } = useApp();
  const isDark = settings.theme !== 'light';

  return (
    <Card className="mb-3 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
          <span className="theme-text-primary text-base font-bold">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 theme-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 theme-text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </Card>
  );
};

const SettingsScreen = ({ embedded = false }) => {
  const { t, settings, updateSettings, settingsSaving, settingsSaveError, settingsLastSavedAt } = useApp();
  const [saveToast, setSaveToast] = useState(null);
  const previousSavingRef = useRef(settingsSaving);
  const lastSeenSavedAtRef = useRef(settingsLastSavedAt);
  const lastSeenErrorRef = useRef(settingsSaveError);
  const toastTimeoutRef = useRef(null);

  const isHourly = settings.workType !== 'pieceWork';

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showSaveToast = (toast) => {
    setSaveToast(toast);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    if (!toast?.persistent) {
      toastTimeoutRef.current = setTimeout(() => {
        setSaveToast(null);
        toastTimeoutRef.current = null;
      }, toast?.duration ?? 2200);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (settingsSaving && !previousSavingRef.current) {
      showSaveToast({
        icon: Loader,
        text: t.settingsSaving || 'Saving settings...',
        className: 'border-amber-500/30 bg-slate-950/90 text-amber-200 shadow-[0_10px_30px_rgba(15,23,42,0.4)]',
        persistent: true
      });
    }

    if (!settingsSaving && previousSavingRef.current && saveToast?.persistent) {
      setSaveToast(null);
    }

    previousSavingRef.current = settingsSaving;
  }, [saveToast?.persistent, settingsSaving, t.settingsSaving]);

  useEffect(() => {
    if (settingsSaveError && settingsSaveError !== lastSeenErrorRef.current) {
      showSaveToast({
        icon: AlertCircle,
        text: settingsSaveError || t.errorSettingsSave || t.errorGeneric || 'Could not save settings',
        className: 'border-red-500/30 bg-slate-950/90 text-red-300 shadow-[0_10px_30px_rgba(127,29,29,0.28)]'
      });
    }

    lastSeenErrorRef.current = settingsSaveError;
  }, [settingsSaveError, t.errorGeneric, t.errorSettingsSave]);

  useEffect(() => {
    if (
      settingsLastSavedAt &&
      settingsLastSavedAt !== lastSeenSavedAtRef.current &&
      !settingsSaveError
    ) {
      showSaveToast({
        icon: CheckCircle2,
        text: t.settingsSaved || 'Settings saved',
        className: 'border-emerald-500/30 bg-slate-950/90 text-emerald-200 shadow-[0_10px_30px_rgba(6,95,70,0.28)]'
      });
    }

    lastSeenSavedAtRef.current = settingsLastSavedAt;
  }, [settingsLastSavedAt, settingsSaveError, t.settingsSaved]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleChange = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
    } catch {
      // Error state is reflected via save status badge.
    }
  };

  const handleFieldToggle = async (field, value) => {
    try {
      await updateSettings({
        enabledFields: {
          ...settings.enabledFields,
          [field]: value
        }
      });
    } catch {
      // Error state is reflected via save status badge.
    }
  };

  const handleStatisticsFieldToggle = async (field, value) => {
    try {
      await updateSettings({
        statisticsFields: {
          ...(settings.statisticsFields || {}),
          [field]: value
        }
      });
    } catch {
      // Error state is reflected via save status badge.
    }
  };

  const SaveStatusIcon = saveToast?.icon;

  const languageOptions = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
    { value: 'he', label: 'עברית' }
  ];

  const currencyOptions = Object.entries(currencies).map(([code, { symbol, name }]) => ({
    value: code,
    label: `${symbol} ${code} - ${name}`
  }));

  const themeOptions = [
    { value: 'dark', label: t.themeDark },
    { value: 'light', label: t.themeLight }
  ];

  const workTypeOptions = [
    { value: 'hourly', label: t.workTypeHourly },
    { value: 'pieceWork', label: t.workTypePieceWork }
  ];

  const colorsLabel = settings.language === 'ru' ? 'Цвета' : settings.language === 'he' ? 'צבעים' : 'Colors';
  const paletteOptions = [
    { value: 'journal', label: settings.language === 'ru' ? 'Основная' : settings.language === 'he' ? 'ראשית' : 'Journal' },
    { value: 'neon', label: settings.language === 'ru' ? 'Неон' : settings.language === 'he' ? 'ניאון' : 'Neon' },
    { value: 'contrast', label: settings.language === 'ru' ? 'Контраст' : settings.language === 'he' ? 'קונטרסט' : 'Contrast' }
  ];

  return (
    <div className={`relative ${embedded ? '' : 'pb-24'}`}>
      {saveToast && (
        <div className="pointer-events-none sticky top-[calc(env(safe-area-inset-top)+0.75rem)] z-30 mb-3 flex justify-center px-2">
          <div className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium backdrop-blur-md ${saveToast.className}`}>
            <SaveStatusIcon className={`h-4 w-4 shrink-0 ${saveToast.persistent ? 'animate-spin' : ''}`} />
            <span>{saveToast.text}</span>
          </div>
        </div>
      )}

      {!embedded && (
        <div className="mb-5">
          <div>
            <h1 className="text-2xl font-bold theme-text-primary">{t.settings}</h1>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
      <Card className="p-4 mb-3 lg:mb-0">
        <h3 className="theme-text-primary text-base font-bold mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 theme-info-text" />
          {t.language} & {t.currency}
        </h3>

        <SettingRow>
          <div className="flex justify-between items-center">
            <span className="theme-text-secondary">{t.language}</span>
            <Select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              options={languageOptions}
              className="w-40"
            />
          </div>
        </SettingRow>

        <SettingRow>
          <div className="flex justify-between items-center">
            <span className="theme-text-secondary">{t.currency}</span>
            <Select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              options={currencyOptions}
              className="w-48"
            />
          </div>
        </SettingRow>

        <SettingRow>
          <div className="flex justify-between items-center">
            <span className="theme-text-secondary flex items-center gap-2">
              {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {t.theme}
            </span>
            <Select
              value={settings.theme || 'dark'}
              onChange={(e) => handleChange('theme', e.target.value)}
              options={themeOptions}
              className="w-40"
            />
          </div>
        </SettingRow>

        <SettingRow noBorder>
          <div className="flex justify-between items-center">
            <span className="theme-text-secondary flex items-center gap-2">
              <Palette className="w-4 h-4" />
              {colorsLabel}
            </span>
            <Select
              value={paletteOrder.includes(settings.colorPalette) ? settings.colorPalette : 'journal'}
              onChange={(e) => handleChange('colorPalette', e.target.value)}
              options={paletteOptions}
              className="w-40"
            />
          </div>
        </SettingRow>
      </Card>

      <Card className="p-4 mb-3 lg:mb-0">
        <h3 className="theme-text-primary text-base font-bold mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5 theme-income-soft-text" />
          {t.workType}
        </h3>

        <SettingRow>
          <div className="flex justify-between items-center">
            <span className="theme-text-secondary">{t.workType}</span>
            <Select
              value={settings.workType || 'hourly'}
              onChange={(e) => handleChange('workType', e.target.value)}
              options={workTypeOptions}
              className="w-40"
            />
          </div>
        </SettingRow>

        {isHourly && (
          <>
            <SettingRow>
              <div className="flex justify-between items-center">
                <span className="theme-text-secondary">{t.hourlyRate}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.hourlyRate}
                    onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
                    className="w-24 text-right"
                  />
                  <span className="theme-text-muted">
                    {currencies[settings.currency]?.symbol}
                  </span>
                </div>
              </div>
            </SettingRow>

            <SettingRow>
              <Toggle
                checked={settings.enableOvertime}
                onChange={(v) => handleChange('enableOvertime', v)}
                label={t.enableOvertime}
                description={t.overtimeInfo}
              />
            </SettingRow>

            {settings.enableOvertime && (
              <SettingRow>
                <Toggle
                  checked={settings.fridayOvertime}
                  onChange={(v) => handleChange('fridayOvertime', v)}
                  label={t.fridayOvertime}
                  description={t.fridayOvertimeInfo}
                />
              </SettingRow>
            )}
          </>
        )}

        <SettingRow>
          <Toggle
            checked={settings.unpaidLunch}
            onChange={(v) => handleChange('unpaidLunch', v)}
            label={t.unpaidLunch}
          />
        </SettingRow>

        {settings.unpaidLunch && (
          <SettingRow>
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                {t.lunchDuration}
              </span>
              <Input
                type="number"
                value={settings.lunchDuration}
                onChange={(e) => handleChange('lunchDuration', parseInt(e.target.value, 10) || 0)}
                className="w-20 text-right"
              />
            </div>
          </SettingRow>
        )}

        <SettingRow noBorder>
          <div className="flex justify-between items-center">
            <span className="theme-text-secondary flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t.tipsCardPercent}
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.tipsCardPercent}
                onChange={(e) => handleChange('tipsCardPercent', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                className="w-20 text-right"
              />
              <span className="theme-text-muted">%</span>
            </div>
          </div>
        </SettingRow>
      </Card>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
      <CollapsibleSection
        title={t.enabledFields}
        icon={SettingsIcon}
        iconColor="theme-info-text"
      >
        <SettingRow>
          <Toggle
            checked={settings.enabledFields?.mileage !== false}
            onChange={(v) => handleFieldToggle('mileage', v)}
            label={t.fieldMileage}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.enabledFields?.tipsCash !== false}
            onChange={(v) => handleFieldToggle('tipsCash', v)}
            label={t.fieldTipsCash}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.enabledFields?.tipsCard !== false}
            onChange={(v) => handleFieldToggle('tipsCard', v)}
            label={t.fieldTipsCard}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.enabledFields?.expenses !== false}
            onChange={(v) => handleFieldToggle('expenses', v)}
            label={t.fieldExpenses}
          />
        </SettingRow>

        <SettingRow noBorder>
          <Toggle
            checked={settings.enabledFields?.bonus !== false}
            onChange={(v) => handleFieldToggle('bonus', v)}
            label={t.fieldBonus}
          />
        </SettingRow>
      </CollapsibleSection>

      <CollapsibleSection
        title={t.statisticsFields}
        icon={BarChart3}
        iconColor="theme-accent-text"
      >
        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.totalHours !== false}
            onChange={(v) => handleStatisticsFieldToggle('totalHours', v)}
            label={t.fieldTotalHours}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.totalEarnings !== false}
            onChange={(v) => handleStatisticsFieldToggle('totalEarnings', v)}
            label={t.fieldTotalEarnings}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.avgPerHour !== false}
            onChange={(v) => handleStatisticsFieldToggle('avgPerHour', v)}
            label={t.fieldAvgPerHour}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.tipsCash !== false}
            onChange={(v) => handleStatisticsFieldToggle('tipsCash', v)}
            label={t.fieldTipsCash}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.tipsCard !== false}
            onChange={(v) => handleStatisticsFieldToggle('tipsCard', v)}
            label={t.fieldTipsCard}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.mileage !== false}
            onChange={(v) => handleStatisticsFieldToggle('mileage', v)}
            label={t.fieldMileage}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.expenses !== false}
            onChange={(v) => handleStatisticsFieldToggle('expenses', v)}
            label={t.fieldExpenses}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.avgHoursPerShift !== false}
            onChange={(v) => handleStatisticsFieldToggle('avgHoursPerShift', v)}
            label={t.fieldAvgHoursPerShift}
          />
        </SettingRow>

        <SettingRow>
          <Toggle
            checked={settings.statisticsFields?.avgIncomePerShift !== false}
            onChange={(v) => handleStatisticsFieldToggle('avgIncomePerShift', v)}
            label={t.fieldAvgIncomePerShift}
          />
        </SettingRow>

        <SettingRow noBorder>
          <Toggle
            checked={settings.statisticsFields?.expenseDetails !== false}
            onChange={(v) => handleStatisticsFieldToggle('expenseDetails', v)}
            label={t.fieldExpenseDetails}
          />
        </SettingRow>
      </CollapsibleSection>
      </div>
    </div>
  );
};

export default SettingsScreen;
