/**
 * دوال التنسيق للأرقام والتواريخ باللغة الإنجليزية
 */

/**
 * تنسيق الأرقام باللغة الإنجليزية
 */
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const defaultOptions = {
    locale: 'en-US',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  };
  
  return new Intl.NumberFormat(defaultOptions.locale, defaultOptions).format(number);
};

/**
 * تنسيق العملة باللغة الإنجليزية
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 EGP';
  }
  
  const defaultOptions = {
    locale: 'en-US',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  };
  
  return `${formatNumber(amount, defaultOptions)} EGP`;
};

/**
 * تنسيق النسب المئوية
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${formatNumber(value, { maximumFractionDigits: decimals })}%`;
};

/**
 * تنسيق التواريخ باللغة الإنجليزية
 */
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const options = {
      'short': {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      'medium': {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      'long': {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      },
      'full': {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    };
    
    return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(date);
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return '-';
  }
};

/**
 * تنسيق التاريخ بصيغة مخصصة
 */
export const formatDateCustom = (dateString, separator = '/') => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}${separator}${month}${separator}${year}`;
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return '-';
  }
};

/**
 * تنسيق الوقت النسبي (منذ كم يوم)
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (error) {
    console.warn('Error calculating relative time:', dateString, error);
    return '-';
  }
};

/**
 * تنسيق حجم الملف
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${formatNumber(bytes / Math.pow(k, i), { maximumFractionDigits: 1 })} ${sizes[i]}`;
};

/**
 * تنسيق الأرقام الكبيرة (K, M, B)
 */
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  });
  
  return formatter.format(number);
};

/**
 * تنسيق المدة الزمنية بالأيام
 */
export const formatDuration = (days) => {
  if (!days || days === 0) return '0 days';
  
  if (days === 1) return '1 day';
  if (days < 7) return `${formatNumber(days)} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }
    return `${weeks}w ${remainingDays}d`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
};
