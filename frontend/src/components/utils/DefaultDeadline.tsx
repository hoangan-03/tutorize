export const getDefaultDeadline = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const hours = String(tomorrow.getHours()).padStart(2, "0");
  const minutes = String(tomorrow.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Deprecated: moved to utils/date.ts. Keep re-exports for backward compatibility if needed.
