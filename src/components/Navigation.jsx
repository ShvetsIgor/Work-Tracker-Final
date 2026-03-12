import React from 'react';
import { ClipboardList, BarChart3, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { t, settings } = useApp();
  
  const isDark = settings.theme !== 'light';
  
  const tabs = [
    { id: 'shifts', icon: ClipboardList, label: t.shifts },
    { id: 'statistics', icon: BarChart3, label: t.statistics },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 px-4 z-50"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className={`max-w-lg mx-auto rounded-[28px] border px-2 py-2 backdrop-blur-2xl transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950/72 border-slate-700/40 shadow-[0_20px_48px_rgba(2,10,23,0.34)]'
          : 'bg-white/85 border-white/80 shadow-[0_18px_36px_rgba(148,163,184,0.22)]'
      }`}>
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[86px] py-2.5 px-4 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'bg-slate-800/80 text-white border border-slate-600/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                  : isDark 
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-105 text-white' : ''} transition-transform`} />
              <span className={`text-xs whitespace-nowrap ${isActive ? 'font-semibold tracking-[0.02em]' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      </div>
    </nav>
  );
};

export default Navigation;
