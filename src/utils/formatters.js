import { currencies } from '@/config/currencies';

/**
 * Format currency amount
 */
export const formatCurrency = (amount, currencyCode = 'ILS') => {
  const currency = currencies[currencyCode];
  const value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  if (!currency) {
    return `${value.toFixed(2)}`;
  }
  
  return `${currency.symbol}${value.toFixed(2)}`;
};

/**
 * Format currency with sign (+ or -)
 */
export const formatCurrencyWithSign = (amount, currencyCode = 'ILS', showPositive = false) => {
  const value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formatted = formatCurrency(Math.abs(value), currencyCode);
  
  if (value < 0) {
    return `-${formatted}`;
  }
  
  if (showPositive && value > 0) {
    return `+${formatted}`;
  }
  
  return formatted;
};

/**
 * Format time from minutes (HH:MM format)
 */
export const formatTime = (totalMinutes) => {
  const mins = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Format time with labels
 */
export const formatTimeLabeled = (totalMinutes, t) => {
  const mins = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}${t?.hoursShort || 'h'}`);
  }
  
  if (minutes > 0 || hours === 0) {
    parts.push(`${minutes}${t?.minutesShort || 'm'}`);
  }
  
  return parts.join(' ');
};

/**
 * Format decimal hours
 */
export const formatDecimalHours = (totalMinutes) => {
  const hours = totalMinutes / 60;
  return hours.toFixed(2);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num, decimals = 0) => {
  const value = typeof num === 'number' ? num : parseFloat(num) || 0;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format mileage
 */
export const formatMileage = (km, t) => {
  const value = typeof km === 'number' ? km : parseFloat(km) || 0;
  return `${formatNumber(value)} ${t?.km || 'km'}`;
};

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 0) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return `${num.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format expense type for display
 */
export const formatExpenseType = (type, t) => {
  return t?.[type] || capitalize(type);
};
