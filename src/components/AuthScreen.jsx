import React, { useMemo, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button, Input } from '@/components/ui';
import { getTranslation } from '@/i18n/translations';

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AuthScreen = () => {
  const { login, register, resetPassword, loginWithGoogle, authError, setAuthError, loading } = useApp();
  
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
  const trimmedName = name.trim();
  const normalizedEmail = email.trim();
  const canSubmit = useMemo(() => {
    if (!normalizedEmail) {
      return false;
    }

    if (mode === 'reset') {
      return true;
    }

    if (!password) {
      return false;
    }

    if (mode === 'register') {
      return Boolean(trimmedName) && Boolean(confirmPassword);
    }

    return true;
  }, [confirmPassword, mode, normalizedEmail, password, trimmedName]);

  const clearErrors = () => {
    if (localError) setLocalError('');
    if (authError) setAuthError(null);
  };
  
  const validateForm = () => {
    setLocalError('');
    
    if (mode === 'register' && !trimmedName) {
      setLocalError(t.errorNameRequired);
      return false;
    }
    
    if (!normalizedEmail) {
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
        await login(normalizedEmail, password);
      } else if (mode === 'register') {
        await register(normalizedEmail, password, trimmedName);
      } else if (mode === 'reset') {
        await resetPassword(normalizedEmail);
        setResetSent(true);
      }
    } catch {
      // Error is handled by context
    }
  };
  
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setLocalError('');
    try {
      await loginWithGoogle();
    } catch {
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
      className="relative min-h-screen flex items-center justify-center p-4 theme-bg-app"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-md">
        <div className="rounded-[24px] border border-white/[0.05] bg-slate-900/60 p-7 backdrop-blur-xl shadow-[0_28px_60px_rgba(2,10,23,0.4)]">
          {/* Language selector */}
          <div className="flex justify-end mb-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-slate-800/70 text-slate-200 px-3 py-1.5 rounded-lg text-xs border border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>

          {/* Logo & Title */}
          <div className="mb-8">
            <div
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl mb-5"
              style={{ background: 'var(--chip-bg)', color: 'var(--chip-text)' }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-slate-400 text-[11px] uppercase tracking-[0.14em]">{t.appName}</div>
            <h1 className="mt-1.5 text-3xl font-bold text-white tracking-tight">
              {mode === 'login' && t.login}
              {mode === 'register' && t.register}
              {mode === 'reset' && t.resetPassword}
            </h1>
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
              <p className="text-slate-400 text-sm mb-6 break-all">{normalizedEmail}</p>
              <Button variant="secondary" onClick={() => switchMode('login')}>
                {t.backToLogin}
              </Button>
            </div>
          ) : (
            <>
              {/* Google Sign In - only for login/register */}
              {mode !== 'reset' && (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3.5 px-4 rounded-2xl transition-colors disabled:opacity-50 shadow-[0_14px_28px_rgba(255,255,255,0.08)]"
                  >
                    <GoogleIcon />
                    {t.continueWithGoogle || 'Войти через Google'}
                  </button>
                  
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-slate-900/90 text-slate-500">{t.or || 'или'}</span>
                    </div>
                  </div>
                </>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name - only for registration */}
                {mode === 'register' && (
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearErrors(); }}
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
                  onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
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
                      onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
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
                    onChange={(e) => { setConfirmPassword(e.target.value); clearErrors(); }}
                    placeholder="••••••••"
                    label={t.confirmPassword}
                    icon={Lock}
                    autoComplete="new-password"
                  />
                )}
                
                {/* Error message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
                {/* Submit button */}
                <Button type="submit" fullWidth loading={loading} disabled={loading || !canSubmit}>
                  {mode === 'login' && t.login}
                  {mode === 'register' && t.register}
                  {mode === 'reset' && t.sendResetEmail}
                </Button>
              </form>
            </>
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
                      className="text-sky-300 hover:text-sky-200 text-sm transition-colors"
                    >
                      {t.register}
                    </button>
                  </div>
                </>
              )}
              
              {mode === 'register' && (
                <button
                  onClick={() => switchMode('login')}
                  className="text-sky-300 hover:text-sky-200 text-sm transition-colors"
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
