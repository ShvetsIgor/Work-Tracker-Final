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
    <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl px-4 py-2 z-50 safe-area-bottom transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-800/95 border-t border-slate-700/50' 
        : 'bg-white/95 border-t border-slate-200'
    }`}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-purple-500/20 text-purple-500' 
                  : isDark 
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
