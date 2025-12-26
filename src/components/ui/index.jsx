import React from 'react';
import { Loader2 } from 'lucide-react';

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
    primary: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
    secondary: 'theme-bg-input theme-text-primary theme-border hover:opacity-80',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
    ghost: 'bg-transparent hover:bg-slate-700/50 theme-text-muted hover:theme-text-primary',
    outline: 'bg-transparent theme-border theme-text-secondary hover:opacity-80'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-medium rounded-xl transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
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
  
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block theme-text-muted text-sm mb-2">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full theme-bg-input rounded-xl 
            px-4 py-3 theme-text-primary
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          onWheel={handleWheel}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-red-400 text-sm">{error}</p>
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
      <select
        className={`
          w-full theme-bg-input rounded-xl 
          px-4 py-3 theme-text-primary
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
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
          ${checked ? 'bg-purple-500' : 'bg-slate-600'}
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
        theme-bg-card rounded-2xl transition-all duration-200
        ${hover ? 'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10' : ''}
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
    default: 'bg-slate-700 theme-text-secondary',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400'
  };
  
  return (
    <span className={`
      px-2 py-1 rounded-lg text-xs font-medium
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
      <Loader2 className={`${sizes[size]} animate-spin text-purple-500`} />
    </div>
  );
};

// Full Screen Loader
export const FullScreenLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-slate-400">Loading...</p>
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
