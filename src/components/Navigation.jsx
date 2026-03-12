import React from 'react';
import { ClipboardList, BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { t, settings } = useApp();
  
  const isDark = settings.theme !== 'light';
  
  const tabs = [
    { id: 'shifts', icon: ClipboardList, label: t.shifts },
    { id: 'statistics', icon: BarChart3, label: t.statistics },
  ];

  return (
    <>
      <aside className="fixed left-6 top-6 bottom-6 z-40 hidden w-64 lg:block">
        <div
          className={`h-full rounded-[30px] border p-4 backdrop-blur-2xl transition-colors duration-300 ${
            isDark
              ? 'border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.22)]'
              : 'bg-white/88 border-white/80 shadow-[0_20px_36px_rgba(148,163,184,0.18)]'
          }`}
          style={isDark ? { background: 'var(--nav-bg)' } : undefined}
        >
          <div className="mb-6 px-2 pt-2">
            <div className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">
              Workspace
            </div>
            <div className="theme-text-primary mt-2 text-xl font-bold">
              {t.appName}
            </div>
          </div>

          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? 'border border-white/[0.06]'
                      : isDark
                        ? 'hover:bg-white/[0.03]'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  style={isDark
                    ? isActive
                      ? { background: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' }
                      : { color: 'var(--nav-idle-text)' }
                    : undefined}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-105' : ''} transition-transform`} />
                  <span className={`${isActive ? 'font-semibold tracking-[0.01em]' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 px-4 z-50 lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div
          className={`max-w-lg mx-auto rounded-[28px] border px-2 py-2 backdrop-blur-2xl transition-colors duration-300 ${
            isDark
              ? 'border-white/[0.05] shadow-[0_16px_28px_rgba(0,0,0,0.2)]'
              : 'bg-white/85 border-white/80 shadow-[0_18px_36px_rgba(148,163,184,0.22)]'
          }`}
          style={isDark ? { background: 'var(--nav-bg)' } : undefined}
        >
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
                      ? 'border border-white/[0.06]' 
                      : isDark 
                        ? 'hover:bg-white/[0.03]'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }
                  `}
                  style={isDark
                    ? isActive
                      ? { background: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' }
                      : { color: 'var(--nav-idle-text)' }
                    : undefined}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-105' : ''} transition-transform`} />
                  <span className={`text-xs whitespace-nowrap ${isActive ? 'font-semibold tracking-[0.02em]' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
