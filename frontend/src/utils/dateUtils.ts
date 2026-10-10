/**
 * Universal Date & Time Formatting Utilities for SalvageReef (IST UTC+5:30)
 */

export const formatDateTime = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return 'N/A';
  try {
    let str = String(dateInput).trim();
    
    // If str is in SQLite/MySQL format 'YYYY-MM-DD HH:mm:ss' without timezone offset
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(str)) {
      str = str.replace(' ', 'T') + '+05:30';
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
      str = str + '+05:30';
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return String(dateInput);
  }
};

export const formatDateOnly = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return 'N/A';
  try {
    let str = String(dateInput).trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(str)) {
      str = str.replace(' ', 'T') + '+05:30';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return String(dateInput);
  }
};

export const formatTimeOnly = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return 'N/A';
  try {
    let str = String(dateInput).trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(str)) {
      str = str.replace(' ', 'T') + '+05:30';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return String(dateInput);
  }
};

/**
 * Safely parse any date input (MySQL string, ISO string, or Date) as Indian Standard Time (IST UTC+5:30)
 */
export const parseIstDate = (dateInput?: string | number | Date | null): Date => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  let str = String(dateInput).trim();
  if (!str) return new Date();

  // If already contains timezone (Z or +HH:mm), parse directly
  if (/Z|[+-]\d{2}:\d{2}$/.test(str)) {
    return new Date(str);
  }

  // SQLite / MySQL 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DD HH:mm'
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    str = str.replace(' ', 'T') + (str.length === 16 ? ':00' : '') + '+05:30';
    return new Date(str);
  }

  // ISO without timezone 'YYYY-MM-DDTHH:mm:ss' or 'YYYY-MM-DDTHH:mm'
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    str = str + (str.length === 16 ? ':00' : '') + '+05:30';
    return new Date(str);
  }

  return new Date(str);
};

/**
 * Convert any date input into 'YYYY-MM-DDTHH:mm' string for HTML datetime-local input fields in IST
 */
export const toLocalInputString = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return '';
  const d = parseIstDate(dateInput);
  if (isNaN(d.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
};

/**
 * Convert any date or datetime-local input string into MySQL 'YYYY-MM-DD HH:mm:ss' format in IST
 */
export const toDbDateTimeString = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return '';
  const str = String(dateInput).trim();

  // If already standard datetime-local 'YYYY-MM-DDTHH:mm'
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    return `${str.replace('T', ' ')}:00`;
  }

  // If already standard MySQL string 'YYYY-MM-DD HH:mm:ss'
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(str)) {
    return str;
  }

  const d = parseIstDate(dateInput);
  if (isNaN(d.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
};

/**
 * Convenient alias to format a date into 'YYYY-MM-DDTHH:mm' input string for datetime-local
 */
export const getLocalDateTimeString = (dateInput?: string | number | Date | null): string => {
  return toLocalInputString(dateInput || new Date());
};

/**
 * Generate future datetime-local string (e.g. +7 days at 18:00 IST)
 */
export const getFutureDateTimeString = (days: number = 7, hours: number = 18, minutes: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return toLocalInputString(d);
};

