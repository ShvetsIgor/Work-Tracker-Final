import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FullScreenLoader } from '@/components/ui';
import AuthScreen from '@/components/AuthScreen';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import ShiftsScreen from '@/components/ShiftsScreen';
import StatisticsScreen from '@/components/StatisticsScreen';
import SettingsScreen from '@/components/SettingsScreen';
import AccountModal from '@/components/AccountModal';

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
    return <AuthScreen />;
  }
  
  const isDark = settings.theme !== 'light';
  
  // Main app
  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-100 via-purple-50 to-slate-100'
      }`}
      dir={rtl ? 'rtl' : 'ltr'}
      data-theme={settings.theme || 'dark'}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
        }`} />
        <div className={`absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
        }`} />
      </div>
      
      <Header onOpenAccount={() => setShowAccountModal(true)} />
      
      <main className="relative max-w-lg mx-auto px-4 py-6">
        {activeTab === 'shifts' && <ShiftsScreen />}
        {activeTab === 'statistics' && <StatisticsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <AccountModal 
        isOpen={showAccountModal} 
        onClose={() => setShowAccountModal(false)} 
      />
    </div>
  );
};

export default App;
