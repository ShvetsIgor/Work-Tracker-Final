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
      <aside className="fixed left-0 top-16 bottom-0 z-40 hidden w-64 lg:block">
        <div
          className={`h-full border-r p-4 transition-colors duration-300 ${
            isDark
              ? 'border-white/[0.05]'
              : 'bg-white/95 border-slate-200/80'
          }`}
          style={isDark ? { background: 'var(--nav-bg)' } : undefined}
        >
          <div className="mb-6 px-2 pt-2">
            <div className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">
              {t.workspace}
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
                  className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? 'border border-white/[0.06]'
                      : isDark
                        ? 'hover:bg-white/[0.03]'
                        : 'hover:bg-slate-100'
                  }`}
                  style={isActive
                    ? { background: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' }
                    : { color: 'var(--nav-idle-text)' }}
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
        className={`fixed bottom-0 left-0 right-0 z-50 border-t lg:hidden ${
          isDark ? 'border-white/[0.05]' : 'border-slate-200/80'
        }`}
        style={isDark ? {
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'var(--nav-bg)'
        } : {
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div
          className={`px-2 py-1.5 backdrop-blur-2xl transition-colors duration-300 ${
            isDark
              ? 'shadow-[0_-16px_28px_rgba(0,0,0,0.18)]'
              : 'bg-white/85 shadow-[0_-18px_36px_rgba(148,163,184,0.18)]'
          }`}
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
                    min-w-[78px] rounded-lg px-3 py-2 transition-all duration-200
                    ${isActive
                      ? 'border border-white/[0.06]'
                      : isDark
                        ? 'hover:bg-white/[0.03]'
                        : 'hover:bg-slate-100'
                    }
                  `}
                  style={isActive
                    ? { background: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' }
                    : { color: 'var(--nav-idle-text)' }}
                >
                  <Icon className={`mb-0.5 h-4.5 w-4.5 ${isActive ? 'scale-105' : ''} transition-transform`} />
                  <span className={`whitespace-nowrap text-[11px] ${isActive ? 'font-semibold tracking-[0.02em]' : 'font-medium'}`}>
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
