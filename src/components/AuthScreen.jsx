import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button, Input } from '@/components/ui';
import { getTranslation } from '@/i18n/translations';

const AuthScreen = () => {
  const { login, register, resetPassword, authError, setAuthError, loading } = useApp();
  
  const [mode, setMode] = useState('login'); // login, register, reset
  const [lang, setLang] = useState('ru');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const t = getTranslation(lang);
  const isRTL = lang === 'he';
  
  const validateForm = () => {
    setLocalError('');
    
    if (mode === 'register' && !name.trim()) {
      setLocalError(t.errorNameRequired);
      return false;
    }
    
    if (!email) {
      setLocalError(t.errorEmailRequired);
      return false;
    }
    
    if (mode !== 'reset' && !password) {
      setLocalError(t.errorPasswordRequired);
      return false;
    }
    
    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError(t.errorPasswordWeak);
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError(t.errorPasswordMismatch);
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!validateForm()) return;
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password, name.trim());
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (error) {
      // Error is handled by context
    }
  };
  
  const switchMode = (newMode) => {
    setMode(newMode);
    setLocalError('');
    setAuthError(null);
    setResetSent(false);
  };
  
  const error = localError || authError;
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Decorative corners */}
        <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-purple-400/30" />
        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-purple-400/30" />
        
        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          {/* Language selector */}
          <div className="flex justify-center mb-6">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>
          
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t.appName}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {mode === 'login' && t.login}
              {mode === 'register' && t.register}
              {mode === 'reset' && t.resetPassword}
            </p>
          </div>
          
          {/* Back button for reset mode */}
          {mode === 'reset' && (
            <button
              onClick={() => switchMode('login')}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToLogin}
            </button>
          )}
          
          {/* Reset success message */}
          {resetSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white mb-4">{t.success}</p>
              <Button variant="secondary" onClick={() => switchMode('login')}>
                {t.backToLogin}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name - only for registration */}
              {mode === 'register' && (
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  label={t.name}
                  icon={User}
                  autoComplete="name"
                />
              )}
              
              {/* Email */}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                label={t.email}
                icon={Mail}
                autoComplete="email"
              />
              
              {/* Password */}
              {mode !== 'reset' && (
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    label={t.password}
                    icon={Lock}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}
              
              {/* Confirm Password */}
              {mode === 'register' && (
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  label={t.confirmPassword}
                  icon={Lock}
                  autoComplete="new-password"
                />
              )}
              
              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {/* Submit button */}
              <Button type="submit" fullWidth loading={loading}>
                {mode === 'login' && t.login}
                {mode === 'register' && t.register}
                {mode === 'reset' && t.sendResetEmail}
              </Button>
            </form>
          )}
          
          {/* Footer links */}
          {!resetSent && (
            <div className="mt-6 text-center space-y-2">
              {mode === 'login' && (
                <>
                  <button
                    onClick={() => switchMode('reset')}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                  <div>
                    <button
                      onClick={() => switchMode('register')}
                      className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      {t.register}
                    </button>
                  </div>
                </>
              )}
              
              {mode === 'register' && (
                <button
                  onClick={() => switchMode('login')}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  {t.login}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
