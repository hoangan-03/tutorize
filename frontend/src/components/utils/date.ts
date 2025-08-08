export const formatDate = (
  dateString: string,
  locale: string = "vi-VN"
): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTime = (
  dateString: string,
  locale: string = "vi-VN"
): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Convert YYYY-MM-DD to DD-MM-YYYY
export const convertISOToDMY = (iso: string): string => {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  if (parts[0].length === 4) {
    const [yyyy, mm, dd] = parts;
    return `${dd}-${mm}-${yyyy}`;
  }
  return iso; 
};

// Convert DD-MM-YYYY to YYYY-MM-DD
export const convertDMYToISO = (dmy: string): string => {
  if (!dmy) return "";
  const parts = dmy.split("-");
  if (parts.length !== 3) return dmy;
  if (parts[0].length === 2) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }
  return dmy; 
};

export const isValidDMY = (dmy: string): boolean => {
  const parts = dmy.split("-");
  if (parts.length !== 3) return false;
  const [ddStr, mmStr, yyyyStr] = parts;
  if (ddStr.length !== 2 || mmStr.length !== 2 || yyyyStr.length !== 4)
    return false;
  const day = Number(ddStr);
  const month = Number(mmStr);
  const year = Number(yyyyStr);
  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  )
    return false;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900)
    return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const autoFormatDMY = (raw: string): string => {
  if (!raw) return "";
  let value = raw.replace(/\D/g, "");
  if (value.length > 8) value = value.slice(0, 8);
  if (value.length >= 5) {
    return `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4)}`;
  } else if (value.length >= 3) {
    return `${value.slice(0, 2)}-${value.slice(2)}`;
  }
  return value;
};
