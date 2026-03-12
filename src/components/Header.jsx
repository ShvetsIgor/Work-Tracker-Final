import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, User, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Header = ({ onOpenAccount }) => {
  const { t, user, logout, settings, rtl } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isDark = settings.theme !== 'light';
  
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
    <header className="sticky top-0 px-4 pt-4 z-40">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className={`w-full flex items-center justify-between gap-3 rounded-[24px] border px-4 py-3 transition-colors duration-300 ${
          isDark
            ? 'theme-bg-header border-white/[0.05] shadow-[0_14px_28px_rgba(0,0,0,0.18)]'
            : 'theme-bg-header border-white/70 shadow-[0_16px_34px_rgba(148,163,184,0.18)]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-[0_14px_28px_rgba(0,0,0,0.12)]"
            style={{ background: 'var(--chip-bg)', color: 'var(--chip-text)' }}
          >
            <Clock className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="theme-text-primary font-bold text-lg tracking-tight">{t.appName}</span>
            <div className="theme-text-muted text-[11px] tracking-[0.08em]">
              Daily shift journal
            </div>
          </div>
          </div>
        
        {/* User menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                isDark 
                  ? 'border border-white/[0.05]' 
                  : 'bg-white/70 hover:bg-white border border-slate-200/80'
              }`}
              style={isDark ? { backgroundColor: 'var(--control-bg)' } : undefined}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--avatar-bg)' }}
              >
                <span className="text-[var(--avatar-text)] text-sm font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="theme-text-primary text-sm font-medium max-w-24 truncate hidden sm:block">
                {displayName}
              </span>
              <ChevronDown className={`w-4 h-4 theme-text-muted transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className={`absolute mt-2 w-48 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 ${
                rtl ? 'left-0' : 'right-0'
              } ${
                isDark 
                  ? 'border border-white/[0.06]' 
                  : 'bg-white border border-slate-200'
              }`}>
                {isDark && (
                  <div
                    className="absolute inset-0 -z-10 rounded-xl"
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
