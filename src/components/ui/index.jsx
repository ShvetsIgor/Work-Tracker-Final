import React from 'react';
import { ChevronDown, Loader2, MapPin } from 'lucide-react';

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'text-[var(--accent-text)]',
    secondary: 'theme-bg-input theme-text-primary theme-border hover:border-white/10 theme-secondary-hover',
    danger: 'bg-[#b4877f]/14 hover:bg-[#b4877f]/20 text-[#e2c3bc] border border-[#b4877f]/16',
    ghost: 'bg-transparent hover:bg-white/[0.04] theme-text-muted hover:theme-text-primary',
    outline: 'bg-transparent theme-border theme-text-secondary hover:border-white/10 hover:text-[#f4efe8]'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      style={variant === 'primary'
        ? {
            backgroundColor: 'var(--accent-secondary)',
            boxShadow: '0 10px 22px var(--accent-shadow)'
          }
        : undefined}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-semibold rounded-lg transition-all duration-200
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        active:scale-[0.98]
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  );
};

// Input Component
export const Input = ({
  label,
  error,
  hideErrorText = false,
  floatingError = false,
  errorClassName = '',
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}) => {
  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    if (props.type === 'number') {
      e.target.blur();
    }
  };
  
  // Add inputMode for numeric keyboard on mobile
  const inputMode = props.type === 'number' ? 'decimal' : undefined;
  
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block theme-text-muted text-sm mb-2">{label}</label>
      )}
      <div className="relative">
        {error && floatingError && (
          <div className={`absolute bottom-full left-3 z-20 mb-2 rounded-lg border border-[#b4877f]/30 bg-slate-950 px-2.5 py-1.5 text-xs text-[#e2c3bc] shadow-lg shadow-black/30 ${errorClassName}`}>
            <div className="relative">
              {error}
              <span className="absolute left-3 top-full h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-[#b4877f]/30 bg-slate-950" />
            </div>
          </div>
        )}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full theme-bg-input rounded-lg 
            px-4 py-3 theme-text-primary
            transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-[#b4877f] focus:ring-[#b4877f]' : ''}
            ${className}
          `}
          onWheel={handleWheel}
          inputMode={inputMode}
          {...props}
        />
      </div>
      {error && !hideErrorText && (
        <p className="mt-1 text-[#d2a49c] text-sm">{error}</p>
      )}
    </div>
  );
};

// Select Component
export const Select = ({
  label,
  options = [],
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block theme-text-muted text-sm mb-2">{label}</label>
      )}
      <div className="relative">
        <select
          className={`
            w-full appearance-none theme-bg-input rounded-lg 
            px-4 py-3 pr-11 theme-text-primary
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent
            cursor-pointer
            ${className}
          `}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center justify-center">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg theme-text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            style={{
              background: 'var(--control-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Component
export const Toggle = ({ checked, onChange, label, description, disabled = false }) => {
  return (
    <label className={`flex items-center justify-between cursor-pointer gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        {label && <span className="theme-text-secondary">{label}</span>}
        {description && <p className="theme-text-muted text-xs mt-1">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
          ${checked ? 'bg-[var(--accent-secondary)]' : 'bg-[#4b4a49]'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full 
            transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
};

// Card Component
export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`
        theme-bg-card rounded-[16px] transition-all duration-200
        ${hover ? 'hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_18px_32px_rgba(0,0,0,0.18)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Badge Component
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-700/70 theme-text-secondary',
    success: 'bg-[#a6b29a]/18 text-[#dce2d3]',
    warning: 'bg-[#b79d7c]/18 text-[#e4d3c0]',
    danger: 'bg-[#b4877f]/18 text-[#e1c0b9]',
    info: 'bg-[var(--accent-soft)] text-[var(--selection-text)]',
    purple: 'bg-[var(--selection-surface)] text-[var(--selection-text)]'
  };
  
  return (
    <span className={`
      px-2 py-1 rounded-md text-xs font-medium
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// Loader Component
export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-[var(--accent-primary)]`} />
    </div>
  );
};

// Full Screen Loader
export const FullScreenLoader = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #101011 0%, #17181b 52%, #111216 100%)' }}
    >
      <style>{`
        @keyframes pinBeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.12);
          }
        }
        @keyframes haloPulse {
          0%, 100% {
            opacity: 0.16;
            transform: scale(1);
          }
          50% {
            opacity: 0.32;
            transform: scale(1.08);
          }
        }
      `}</style>

      <div className="relative z-10 text-center">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(138,160,182,0.18), transparent 70%)',
              animation: 'haloPulse 1.8s ease-in-out infinite'
            }}
          />
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full border"
            style={{
              background: 'rgba(27, 28, 32, 0.84)',
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow: '0 14px 30px rgba(0,0,0,0.28)',
              animation: 'pinBeat 1.3s ease-in-out infinite'
            }}
          >
            <MapPin className="h-6 w-6 text-[#d8c8b5]" />
          </div>
        </div>

        <h1
          className="mb-1 text-[28px] font-bold"
          style={{
            background: 'linear-gradient(90deg, #d8c8b5, #f4efe8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Shifts
        </h1>
        <div className="theme-text-muted text-sm">Loading</div>
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-16">
      {Icon && (
        <div className="w-20 h-20 mx-auto theme-bg-card rounded-full flex items-center justify-center mb-4">
          <Icon className="w-10 h-10 theme-text-muted" />
        </div>
      )}
      {title && <h3 className="theme-text-primary font-medium mb-2">{title}</h3>}
      {description && <p className="theme-text-muted mb-6">{description}</p>}
      {action}
    </div>
  );
};

// Divider Component
export const Divider = ({ className = '' }) => {
  return <div className={`border-b theme-border ${className}`} />;
};
