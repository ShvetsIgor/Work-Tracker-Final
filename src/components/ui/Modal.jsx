import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  showClose = true 
}) => {
  const { rtl, settings } = useApp();
  const isDark = settings?.theme !== 'light';
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-20"
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          relative w-full ${sizes[size]} 
          ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          rounded-2xl border
          max-h-[85vh] flex flex-col
          animate-slide-up
          overflow-hidden
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            {title && (
              <h2 className="text-xl font-bold theme-text-primary">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} flex gap-3`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
