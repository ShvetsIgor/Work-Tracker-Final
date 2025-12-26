import React from 'react';
import { Globe, Wallet, Utensils, CreditCard, Settings as SettingsIcon, Sun, Moon, Briefcase } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, Input, Select, Toggle } from '@/components/ui';
import { currencies } from '@/config/currencies';

const SettingRow = ({ children, noBorder = false }) => (
  <div className={`py-4 ${!noBorder ? 'border-b border-slate-700/50 dark:border-slate-700/50' : ''}`}>
    {children}
  </div>
);

const SettingsScreen = () => {
  const { t, settings, updateSettings } = useApp();
  
  const isDark = settings.theme !== 'light';
  const isHourly = settings.workType !== 'pieceWork';
  
  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };
  
  const handleFieldToggle = (field, value) => {
    updateSettings({
      enabledFields: {
        ...settings.enabledFields,
        [field]: value
      }
    });
  };
  
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
  
  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold theme-text-primary mb-6">{t.settings}</h1>
      
      {/* Language, Currency & Theme */}
      <Card className="p-4 mb-4">
        <h3 className="theme-text-primary font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" />
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
        
        <SettingRow noBorder>
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
      </Card>
      
      {/* Work Type & Payment Settings */}
      <Card className="p-4 mb-4">
        <h3 className="theme-text-primary font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-green-400" />
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
        
        {/* Hourly-specific settings */}
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
                onChange={(e) => handleChange('lunchDuration', parseInt(e.target.value) || 0)}
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
      
      {/* Enabled Fields */}
      <Card className="p-4 mb-4">
        <h3 className="theme-text-primary font-semibold mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-400" />
          {t.enabledFields}
        </h3>
        
        <SettingRow>
          <Toggle
            checked={settings.enabledFields.mileage}
            onChange={(v) => handleFieldToggle('mileage', v)}
            label={t.fieldMileage}
          />
        </SettingRow>
        
        <SettingRow>
          <Toggle
            checked={settings.enabledFields.tipsCash}
            onChange={(v) => handleFieldToggle('tipsCash', v)}
            label={t.fieldTipsCash}
          />
        </SettingRow>
        
        <SettingRow>
          <Toggle
            checked={settings.enabledFields.tipsCard}
            onChange={(v) => handleFieldToggle('tipsCard', v)}
            label={t.fieldTipsCard}
          />
        </SettingRow>
        
        <SettingRow>
          <Toggle
            checked={settings.enabledFields.expenses}
            onChange={(v) => handleFieldToggle('expenses', v)}
            label={t.fieldExpenses}
          />
        </SettingRow>
        
        <SettingRow noBorder>
          <Toggle
            checked={settings.enabledFields.bonus}
            onChange={(v) => handleFieldToggle('bonus', v)}
            label={t.fieldBonus}
          />
        </SettingRow>
      </Card>
    </div>
  );
};

export default SettingsScreen;
