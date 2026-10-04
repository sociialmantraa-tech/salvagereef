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
