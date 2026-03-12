import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FullScreenLoader } from '@/components/ui';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import ShiftsScreen from '@/components/ShiftsScreen';

const AuthScreen = lazy(() => import('@/components/AuthScreen'));
const StatisticsScreen = lazy(() => import('@/components/StatisticsScreen'));
const SettingsScreen = lazy(() => import('@/components/SettingsScreen'));
const AccountModal = lazy(() => import('@/components/AccountModal'));

const App = () => {
  const { user, authLoading, rtl, settings } = useApp();
  const [activeTab, setActiveTab] = useState('shifts');
  const [showAccountModal, setShowAccountModal] = useState(false);
  
  // Apply theme to document
  useEffect(() => {
    const theme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings.theme]);
  
  // Scroll to top when tab changes
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
      className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_28%),linear-gradient(145deg,#07111f_0%,#0d1b2f_48%,#08131f_100%)]'
          : 'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_26%),linear-gradient(145deg,#f4f7fb_0%,#e9f0f8_48%,#f8fbff_100%)]'
      }`}
      dir={rtl ? 'rtl' : 'ltr'}
      data-theme={settings.theme || 'dark'}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-sky-400/10' : 'bg-sky-400/16'
        }`} />
        <div className={`absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-blue-500/12' : 'bg-blue-500/16'
        }`} />
        <div className={`absolute inset-x-0 top-0 h-48 ${
          isDark ? 'bg-[linear-gradient(to_bottom,rgba(7,17,31,0.55),transparent)]' : 'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.5),transparent)]'
        }`} />
      </div>
      
      <Header onOpenAccount={() => setShowAccountModal(true)} />
      
      <main className="relative max-w-lg mx-auto px-4 py-6 pb-32">
        {activeTab === 'shifts' && <ShiftsScreen />}
        {activeTab === 'statistics' && (
          <Suspense fallback={secondaryScreenFallback}>
            <StatisticsScreen />
          </Suspense>
        )}
        {activeTab === 'settings' && (
          <Suspense fallback={secondaryScreenFallback}>
            <SettingsScreen />
          </Suspense>
        )}
      </main>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {showAccountModal && (
        <Suspense fallback={null}>
          <AccountModal 
            isOpen={showAccountModal} 
            onClose={() => setShowAccountModal(false)} 
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
