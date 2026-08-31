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

const LOVELACE_PER_ADA = 1_000_000n;

/** ADA display from lovelace without `Number` rounding. */
export function lovelaceToAdaString(lovelace: bigint): string {
  const sign = lovelace < 0n ? '-' : '';
  const abs = lovelace < 0n ? -lovelace : lovelace;
  const whole = abs / LOVELACE_PER_ADA;
  const frac = abs % LOVELACE_PER_ADA;
  if (frac === 0n) {
    return `${sign}${whole.toString()}`;
  }
  return `${sign}${whole.toString()}.${frac.toString().padStart(6, '0').replace(/0+$/, '')}`;
}






