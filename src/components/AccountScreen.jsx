import React, { useEffect, useState } from 'react';
import { Mail, Settings as SettingsIcon, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button, Card, Input } from '@/components/ui';
import SettingsScreen from '@/components/SettingsScreen';

const AccountScreen = () => {
  const { t, user, updateProfile, settings } = useApp();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setError('');
  }, [user]);

  const trimmedName = name.trim();
  const currentName = user?.name || '';
  const hasChanges = trimmedName !== currentName;
  const isNameValid = trimmedName.length > 0;

  const handleSave = async () => {
    if (!isNameValid) {
      setError(t.errorNameRequired);
      return;
    }

    if (!hasChanges) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateProfile({ name: trimmedName });
    } catch (saveError) {
      setError(t.errorGeneric);
      console.error('Error saving profile:', saveError);
    } finally {
      setSaving(false);
    }
  };

  const isProfileSection = activeSection === 'profile';
  const displayName = trimmedName || user?.email || 'U';

  return (
    <div className="space-y-4 pb-24 lg:space-y-5 lg:pb-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold theme-text-primary">{t.account}</h1>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px,minmax(0,1fr)]">
        <Card className="h-fit p-3 lg:sticky lg:top-28">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('profile')}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                isProfileSection
                  ? 'theme-text-primary'
                  : 'theme-text-secondary border-transparent hover:border-[color:var(--border-card)]'
              }`}
              style={
                isProfileSection
                  ? {
                      background: 'var(--nav-active-bg)',
                      color: 'var(--nav-active-text)',
                      borderColor: 'var(--selection-border)'
                    }
                  : undefined
              }
            >
              <User className="h-4.5 w-4.5" />
              <div>
                <div className="text-sm font-semibold">{t.profile || t.account}</div>
                <div className={`text-xs ${isProfileSection ? 'opacity-75' : 'theme-text-muted'}`}>
                  {t.name}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                !isProfileSection
                  ? 'theme-text-primary'
                  : 'theme-text-secondary border-transparent hover:border-[color:var(--border-card)]'
              }`}
              style={
                !isProfileSection
                  ? {
                      background: 'var(--nav-active-bg)',
                      color: 'var(--nav-active-text)',
                      borderColor: 'var(--selection-border)'
                    }
                  : undefined
              }
            >
              <SettingsIcon className="h-4.5 w-4.5" />
              <div>
                <div className="text-sm font-semibold">{t.settings}</div>
                <div className={`text-xs ${!isProfileSection ? 'opacity-75' : 'theme-text-muted'}`}>
                  {settings.theme === 'dark' ? t.themeDark : t.themeLight}
                </div>
              </div>
            </button>
          </div>
        </Card>

        {isProfileSection ? (
          <Card className="p-5 lg:p-6">
            <div className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-[0_14px_28px_rgba(0,0,0,0.12)]"
                    style={{ background: 'var(--chip-bg)' }}
                  >
                    <span className="text-3xl font-bold text-[var(--chip-text)]">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold theme-text-primary">
                      {trimmedName || currentName || user?.email}
                    </h2>
                    <p className="truncate text-sm theme-text-muted">{user?.email}</p>
                  </div>
                </div>

                <div className="flex gap-2 sm:justify-end">
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={!hasChanges || !isNameValid}
                  >
                    {t.save}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) {
                      setError('');
                    }
                  }}
                  label={t.name}
                  icon={User}
                  placeholder={t.namePlaceholder}
                  error={error}
                />

                <div>
                  <label className="mb-2 block text-sm theme-text-muted">{t.email}</label>
                  <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 theme-bg-input theme-border-card">
                    <Mail className="h-5 w-5 theme-text-muted" />
                    <span className="truncate theme-text-primary">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <SettingsScreen embedded />
        )}
      </div>
    </div>
  );
};

export default AccountScreen;
