import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, User, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Header = ({ onOpenAccount }) => {
  const { t, user, logout, settings } = useApp();
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
    <header className={`sticky top-0 theme-bg-header px-4 py-4 z-40 transition-colors duration-300`}>
      <div className="max-w-lg mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="theme-text-primary font-bold text-lg">{t.appName}</span>
        </div>
        
        {/* User menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-slate-700/50 hover:bg-slate-700' 
                  : 'bg-white/50 hover:bg-white/80 border border-slate-200'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
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
              <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 ${
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
    </header>
  );
};

export default Header;
