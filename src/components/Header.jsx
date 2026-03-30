import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, User, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Header = ({ onOpenAccount }) => {
  const { t, user, logout, settings, rtl } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isDark = settings.theme !== 'light';
  const mobileSafeTop = 'calc(env(safe-area-inset-top, 0px) + 0.35rem)';
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleAccountClick = () => {
    setIsMenuOpen(false);
    onOpenAccount();
  };
  
  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };
  
  // Get display name (name or first part of email)
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  
  return (
    <header
      className={`sticky top-0 z-[70] border-b px-0 lg:border-b-0 lg:px-8 lg:pt-6 ${
        isDark ? 'theme-bg-header border-white/[0.05]' : 'theme-bg-header border-slate-200/80'
      }`}
      style={{ paddingTop: mobileSafeTop }}
    >
      <div className="mx-auto flex justify-between items-center lg:max-w-7xl lg:pl-[18rem]">
        {/* Logo */}
        <div className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors duration-300 lg:rounded-[16px] lg:border ${
          isDark
            ? 'theme-bg-header lg:border-white/[0.05] lg:shadow-[0_14px_28px_rgba(0,0,0,0.18)]'
            : 'theme-bg-header lg:border-white/70 lg:shadow-[0_16px_34px_rgba(148,163,184,0.18)]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg shadow-[0_10px_22px_rgba(0,0,0,0.1)]"
            style={{ background: 'var(--chip-bg)', color: 'var(--chip-text)' }}
          >
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="theme-text-primary text-base font-bold tracking-tight">{t.appName}</span>
            <div className="theme-text-muted text-[10px] tracking-[0.08em]">
              Daily shift journal
            </div>
          </div>
          </div>
        
        {/* User menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${
                isDark 
                  ? 'border border-white/[0.05]' 
                  : 'bg-white/70 hover:bg-white border border-slate-200/80'
              }`}
              style={isDark ? { backgroundColor: 'var(--control-bg)' } : undefined}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: 'var(--avatar-bg)' }}
              >
                <span className="text-xs font-medium text-[var(--avatar-text)]">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden max-w-24 truncate text-sm font-medium theme-text-primary sm:block">
                {displayName}
              </span>
              <ChevronDown className={`w-4 h-4 theme-text-muted transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className={`absolute mt-2 w-48 rounded-[14px] shadow-xl overflow-hidden animate-fade-in z-[90] ${
                rtl ? 'left-0' : 'right-0'
              } ${
                isDark 
                  ? 'border border-white/[0.06]' 
                  : 'bg-white border border-slate-200'
              }`}>
                {isDark && (
                  <div
                    className="absolute inset-0 -z-10 rounded-[14px]"
                    style={{ background: 'var(--menu-bg)' }}
                  />
                )}
                <div className={`px-4 py-3 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-200'}`}>
                  <p className="theme-text-primary font-medium truncate">{user.name || displayName}</p>
                  <p className="theme-text-muted text-xs truncate">{user.email}</p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={handleAccountClick}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 theme-text-secondary transition-colors ${
                      isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{t.account}</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-red-500 transition-colors ${
                      isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;
