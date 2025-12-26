import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { ru, enUS, he } from 'date-fns/locale';

const locales = {
  ru: ru,
  en: enUS,
  he: he
};

/**
 * Get effective date for shift entry
 * If current time is before 3 AM, return yesterday's date
 * This handles overnight shifts that end after midnight
 */
export const getEffectiveDate = () => {
  const now = new Date();
  const hours = now.getHours();
  
  if (hours < 3) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return format(yesterday, 'yyyy-MM-dd');
  }
  
  return format(now, 'yyyy-MM-dd');
};

/**
 * Format date for display
 */
export const formatDate = (dateStr, lang = 'ru', formatStr = 'EEE, d MMM') => {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, formatStr, { locale: locales[lang] || locales.ru });
  } catch {
    return dateStr;
  }
};

/**
 * Format date for full display
 */
export const formatDateFull = (dateStr, lang = 'ru') => {
  return formatDate(dateStr, lang, 'd MMMM yyyy');
};

/**
 * Get date range for period
 */
export const getDateRange = (period, customFrom = null, customTo = null) => {
  const now = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
      
    case 'thisWeek':
      startDate = startOfWeek(now, { weekStartsOn: 0 });
      endDate = endOfDay(now);
      break;
      
    case 'thisMonth':
      startDate = startOfMonth(now);
      endDate = endOfDay(now);
      break;
      
    case 'custom':
      startDate = customFrom ? startOfDay(parseISO(customFrom)) : startOfDay(new Date(0));
      endDate = customTo ? endOfDay(parseISO(customTo)) : endOfDay(now);
      break;
      
    default:
      startDate = startOfMonth(now);
      endDate = endOfDay(now);
  }
  
  return { startDate, endDate };
};

/**
 * Check if date is within range
 */
export const isDateInRange = (dateStr, startDate, endDate) => {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return isWithinInterval(date, { start: startDate, end: endDate });
  } catch {
    return false;
  }
};

/**
 * Format time from minutes
 */
export const formatTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Format time with labels
 */
export const formatTimeWithLabels = (totalMinutes, t) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}${t.minutesShort}`;
  }
  
  if (minutes === 0) {
    return `${hours}${t.hoursShort}`;
  }
  
  return `${hours}${t.hoursShort} ${minutes}${t.minutesShort}`;
};

/**
 * Parse time string (HH:MM) to minutes
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Calculate break duration in minutes
 */
export const calculateBreakDuration = (breakStart, breakEnd) => {
  if (!breakStart || !breakEnd) return 0;
  
  const startMinutes = parseTimeToMinutes(breakStart);
  const endMinutes = parseTimeToMinutes(breakEnd);
  
  // Handle overnight breaks
  if (endMinutes < startMinutes) {
    return (24 * 60 - startMinutes) + endMinutes;
  }
  
  return endMinutes - startMinutes;
};

/**
 * Get today's date string
 */
export const getTodayString = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Check if date is today
 */
export const isToday = (dateStr) => {
  return dateStr === getTodayString();
};

/**
 * Check if date is yesterday
 */
export const isYesterday = (dateStr) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === format(yesterday, 'yyyy-MM-dd');
};
