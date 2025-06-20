// utils/anonymizeCV.ts
export function anonymizeCV(text: string): string {
  // Remove emails.
  let sanitized = text.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    '[Email Removed]'
  );
  
  // Remove phone numbers:
  // Require at least 10 digits in total (ignoring spaces/hyphens).
  // This regex will not match common date ranges like "2022 - 2023" (which have only 8 or 9 digits).
  sanitized = sanitized.replace(
    /\+?\d[\d\s-]{9,}\d/g,
    '[Phone Removed]'
  );
  
  // Additional rules for addresses, names, etc. can be added here.
  return sanitized.trim();
}
