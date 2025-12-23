/**
 * Normalizes numeric input strings by trimming whitespace and removing
 * unnecessary leading zeros. Keeps a leading zero before a decimal point so
 * users can type values like "0.5" naturally.
 */
export function normalizeNumberString(
  rawValue: string,
  options: { allowDecimal?: boolean } = {}
): string {
  const { allowDecimal = true } = options;
  const trimmed = rawValue.trim();

  if (!trimmed) return '';

  // Strip all non-numeric characters, keeping at most one decimal point when allowed.
  if (allowDecimal) {
    const [intPartRaw = '', ...rest] = trimmed.replace(/[^\d.]/g, '').split('.');
    const fractional = rest.join('');
    const hasDecimal = trimmed.includes('.') || rest.length > 0;

    const normalizedInt =
      intPartRaw.replace(/^0+(?=\d)/, '') || '0';

    if (!hasDecimal) {
      return normalizedInt;
    }

    // Preserve trailing decimal while typing (e.g., "1.")
    const trailingDot = trimmed.endsWith('.') && fractional === '';
    return trailingDot
      ? `${normalizedInt}.`
      : `${normalizedInt}.${fractional}`;
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly.replace(/^0+(?=\d)/, '') || (digitsOnly ? '0' : '');
}


