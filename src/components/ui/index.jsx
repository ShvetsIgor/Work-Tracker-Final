import React from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

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
    secondary: 'theme-bg-input theme-text-primary theme-border hover:border-white/10 hover:bg-[#2f3137]',
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
        font-semibold rounded-xl transition-all duration-200 
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
          <div className={`absolute bottom-full left-3 z-20 mb-2 rounded-xl border border-[#b4877f]/30 bg-slate-950 px-2.5 py-1.5 text-xs text-[#e2c3bc] shadow-lg shadow-black/30 ${errorClassName}`}>
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
            w-full theme-bg-input rounded-xl 
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
            w-full appearance-none theme-bg-input rounded-xl 
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
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#2f2e2d] text-[var(--text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
        theme-bg-card rounded-[24px] transition-all duration-200
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
      <Loader2 className={`${sizes[size]} animate-spin text-[var(--accent-primary)]`} />
    </div>
  );
};

// Full Screen Loader - GPS Route animation
export const FullScreenLoader = () => {
  const routePath = "M 25,80 C 70,30 100,30 135,65 C 165,95 195,40 235,45 C 260,48 280,70 295,75";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0a0a1a 100%)' }}
    >
      <style>{`
        @keyframes routeDraw {
          0%   { stroke-dashoffset: 700; opacity: 1; }
          65%  { stroke-dashoffset: 0;   opacity: 1; }
          80%  { stroke-dashoffset: 0;   opacity: 1; }
          92%  { stroke-dashoffset: 0;   opacity: 0; }
          100% { stroke-dashoffset: 700; opacity: 0; }
        }
        @keyframes ambientFloat {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%       { opacity: 0.22; transform: scale(1.08); }
        }
        @keyframes loadDot {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes pinPop {
          0%   { opacity: 0; transform: scale(0.2) translateY(-12px); }
          65%  { opacity: 1; transform: scale(1.15) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .start-pin { transform-box: fill-box; transform-origin: 50% 100%; animation: pinPop 0.45s ease-out 0.25s both; }
        .end-pin   { transform-box: fill-box; transform-origin: 50% 100%; animation: pinPop 0.45s ease-out 2.1s both; }
      `}</style>

      {/* Map grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.05 }}>
        <defs>
          <pattern id="mapGrid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#7c3aed" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapGrid)" />
      </svg>

      {/* Ambient glow orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '18%', left: '12%', width: 340, height: 340,
          background: 'radial-gradient(circle, rgba(124,58,237,0.28), transparent 70%)',
          animation: 'ambientFloat 3.5s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: '18%', right: '12%', width: 340, height: 340,
          background: 'radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%)',
          animation: 'ambientFloat 3.5s ease-in-out 1.75s infinite',
        }}
      />

      <div className="relative z-10 text-center">
        {/* Route SVG */}
        <div style={{ width: 300, margin: '0 auto 28px' }}>
          <svg viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#7c3aed" />
                <stop offset="50%"  stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="pathGlow" x="-10%" y="-80%" width="120%" height="260%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="dotGlow" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Shadow route (always visible, dim) */}
            <path d={routePath} fill="none" stroke="#312e81" strokeWidth="3.5" strokeLinecap="round" />

            {/* Animated glowing route */}
            <path
              d={routePath}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#pathGlow)"
              style={{ strokeDasharray: 700, strokeDashoffset: 700, animation: 'routeDraw 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
            />

            {/* Waypoint markers */}
            <circle cx="135" cy="65" r="4.5" fill="#8b5cf6" opacity="0.85" />
            <circle cx="235" cy="45" r="4.5" fill="#60a5fa" opacity="0.85" />

            {/* Start pin (purple) */}
            <g className="start-pin">
              <circle cx="25" cy="72" r="10" fill="#7c3aed" opacity="0">
                <animate attributeName="r"       values="10;20"    dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0"   dur="1.8s" repeatCount="indefinite" />
              </circle>
              <path d="M25,55 C18,55 13,61 13,67 C13,76 25,88 25,88 C25,88 37,76 37,67 C37,61 32,55 25,55Z" fill="#7c3aed" />
              <circle cx="25" cy="67" r="4.5" fill="white" opacity="0.92" />
            </g>

            {/* End pin (blue) */}
            <g className="end-pin">
              <path d="M295,53 C288,53 283,59 283,65 C283,74 295,86 295,86 C295,86 307,74 307,65 C307,59 302,53 295,53Z" fill="#3b82f6" />
              <circle cx="295" cy="65" r="4.5" fill="white" opacity="0.92" />
            </g>

            {/* Moving GPS vehicle dot */}
            <g filter="url(#dotGlow)">
              <animateMotion dur="2.6s" repeatCount="indefinite" path={routePath} />
              <circle r="10" fill="#7c3aed" opacity="0.35" />
              <circle r="6"  fill="#c4b5fd" />
              <circle r="2.5" fill="white" opacity="0.95" />
            </g>
          </svg>
        </div>

        {/* App name */}
        <h1
          className="text-4xl font-bold mb-4"
          style={{
            background: 'linear-gradient(90deg, #a78bfa, #e879f9, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Shifts
        </h1>

        {/* Loading dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7 }}>
          {[0, 150, 300].map((delay, i) => (
            <div
              key={i}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#a78bfa',
                animation: `loadDot 0.85s ease-in-out ${delay}ms infinite`,
              }}
            />
          ))}
        </div>
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
