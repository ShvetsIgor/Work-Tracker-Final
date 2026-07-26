import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FullScreenLoader } from '@/components/ui';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import ShiftsScreen from '@/components/ShiftsScreen';
import { colorPalettes } from '@/config/colorPalettes';

const AuthScreen = lazy(() => import('@/components/AuthScreen'));
const StatisticsScreen = lazy(() => import('@/components/StatisticsScreen'));
const AccountScreen = lazy(() => import('@/components/AccountScreen'));

const App = () => {
  const { user, authLoading, rtl, settings } = useApp();
  const [activeTab, setActiveTab] = useState('shifts');
  const [accountSection, setAccountSection] = useState('profile');
  
  // Apply theme to document
  useEffect(() => {
    const theme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    const paletteId = settings.colorPalette || 'journal';
    const fallbackPaletteId = colorPalettes[paletteId] ? paletteId : 'journal';
    const palette = colorPalettes[fallbackPaletteId]?.[theme] || colorPalettes.journal[theme];

    document.documentElement.style.setProperty('--accent-primary', palette.accentPrimary);
    document.documentElement.style.setProperty('--accent-secondary', palette.accentSecondary);
    document.documentElement.style.setProperty('--accent-text', palette.accentText);
    document.documentElement.style.setProperty('--accent-soft', palette.accentSoft);
    document.documentElement.style.setProperty('--accent-shadow', palette.accentShadow);
    document.documentElement.style.setProperty('--income-color', palette.incomeColor);
    document.documentElement.style.setProperty('--income-soft', palette.incomeSoft);
    document.documentElement.style.setProperty('--info-color', palette.infoColor);
    document.documentElement.style.setProperty('--warm-color', palette.warmColor);
    document.documentElement.style.setProperty('--danger-color', palette.dangerColor);
    document.documentElement.style.setProperty('--selection-surface', palette.selectionSurface);
    document.documentElement.style.setProperty('--selection-border', palette.selectionBorder);
    document.documentElement.style.setProperty('--selection-text', palette.selectionText);
    document.documentElement.style.setProperty('--glow-one', palette.glowOne);
    document.documentElement.style.setProperty('--glow-two', palette.glowTwo);
    document.documentElement.style.setProperty('--bg-end', palette.bgEnd);
    document.documentElement.style.setProperty('--decor-one', palette.decorOne);
    document.documentElement.style.setProperty('--decor-two', palette.decorTwo);
    document.documentElement.style.setProperty('--top-veil', palette.topVeil);
    document.documentElement.style.setProperty('--chip-bg', palette.chipBg);
    document.documentElement.style.setProperty('--chip-text', palette.chipText);
    document.documentElement.style.setProperty('--control-bg', palette.controlBg);
    document.documentElement.style.setProperty('--control-hover', palette.controlHover);
    document.documentElement.style.setProperty('--avatar-bg', palette.avatarBg);
    document.documentElement.style.setProperty('--avatar-text', palette.avatarText);
    document.documentElement.style.setProperty('--menu-bg', palette.menuBg);
    document.documentElement.style.setProperty('--nav-bg', palette.navBg);
    document.documentElement.style.setProperty('--nav-active-bg', palette.navActiveBg);
    document.documentElement.style.setProperty('--nav-active-text', palette.navActiveText);
    document.documentElement.style.setProperty('--nav-idle-text', palette.navIdleText);
    document.documentElement.style.setProperty('--nav-idle-hover', palette.navIdleHover);

    const optionalVars = [
      ['--bg-primary', palette.bgPrimary],
      ['--bg-secondary', palette.bgSecondary],
      ['--bg-tertiary', palette.bgTertiary],
      ['--bg-card', palette.bgCard],
      ['--bg-card-strong', palette.bgCardStrong],
      ['--bg-input', palette.bgInput],
      ['--bg-header', palette.bgHeader],
      ['--border-color', palette.borderColor],
      ['--border-card', palette.borderCard],
      ['--text-primary', palette.textPrimary],
      ['--text-secondary', palette.textSecondary],
      ['--text-muted', palette.textMuted],
      ['--text-placeholder', palette.textPlaceholder],
      ['--scrollbar-track', palette.scrollbarTrack],
      ['--scrollbar-thumb', palette.scrollbarThumb]
    ];

    optionalVars.forEach(([name, value]) => {
      if (value) {
        document.documentElement.style.setProperty(name, value);
      } else {
        document.documentElement.style.removeProperty(name);
      }
    });
  }, [settings.theme, settings.colorPalette]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);
  
  // Show loading while checking auth
  if (authLoading) {
    return <FullScreenLoader />;
  }
  
  // Show auth screen if not logged in
  if (!user) {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <AuthScreen />
      </Suspense>
    );
  }
  
  const isDark = settings.theme !== 'light';
  const secondaryScreenFallback = (
    <div className="py-24">
      <FullScreenLoader />
    </div>
  );
  
  // Main app
  return (
    <div 
      className={`min-h-dvh transition-colors duration-300 ${
        isDark 
          ? 'bg-[radial-gradient(circle_at_top_left,var(--glow-one),transparent_20%),radial-gradient(circle_at_bottom_right,var(--glow-two),transparent_24%),linear-gradient(145deg,var(--bg-primary)_0%,var(--bg-secondary)_50%,var(--bg-end)_100%)]'
          : 'bg-[radial-gradient(circle_at_top_left,var(--glow-one),transparent_24%),radial-gradient(circle_at_bottom_right,var(--glow-two),transparent_26%),linear-gradient(145deg,var(--bg-primary)_0%,var(--bg-secondary)_48%,var(--bg-end)_100%)]'
      }`}
      dir={rtl ? 'rtl' : 'ltr'}
      data-theme={settings.theme || 'dark'}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl bg-[var(--decor-one)]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl bg-[var(--decor-two)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,var(--top-veil),transparent)]" />
      </div>
      
      <Header
        onOpenAccount={() => {
          setAccountSection('profile');
          setActiveTab('account');
        }}
        onOpenSettings={() => {
          setAccountSection('settings');
          setActiveTab('account');
        }}
      />

      <main className="relative mx-auto max-w-7xl px-4 py-5 pb-32 lg:pl-[17rem] lg:pr-8 lg:py-6">
        {activeTab === 'shifts' && <ShiftsScreen />}
        {activeTab === 'statistics' && (
          <Suspense fallback={secondaryScreenFallback}>
            <StatisticsScreen />
          </Suspense>
        )}
        {activeTab === 'account' && (
          <Suspense fallback={secondaryScreenFallback}>
            <AccountScreen initialSection={accountSection} />
          </Suspense>
        )}
      </main>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
