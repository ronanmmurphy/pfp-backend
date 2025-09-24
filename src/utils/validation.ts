export function ensureRequiredFields(
  obj: any,
  requiredFields: string[],
): { isValid: boolean; missingFields?: string[] } {
  const missing = requiredFields.filter(
    (k) => obj[k] === undefined || obj[k] === null,
  );
  return {
    isValid: missing.length === 0,
    missingFields: missing.length > 0 ? missing : undefined,
  };
}
