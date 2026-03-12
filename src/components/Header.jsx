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
        <div className={`w-full flex items-center justify-between gap-3 rounded-[28px] border px-4 py-3 transition-colors duration-300 ${
          isDark
            ? 'theme-bg-header border-slate-700/40 shadow-[0_16px_42px_rgba(2,10,23,0.28)]'
            : 'theme-bg-header border-white/70 shadow-[0_16px_34px_rgba(148,163,184,0.18)]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_14px_28px_rgba(14,165,233,0.28)]">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="theme-text-primary font-bold text-lg tracking-tight">{t.appName}</span>
            <div className="theme-text-muted text-[11px] uppercase tracking-[0.22em]">
              Work Ledger
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
                  ? 'bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50' 
                  : 'bg-white/70 hover:bg-white border border-slate-200/80'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-medium">
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
                  ? 'bg-slate-800 border border-slate-700' 
                  : 'bg-white border border-slate-200'
              }`}>
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
