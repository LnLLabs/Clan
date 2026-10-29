/** Keep identical to genwealth src/utils/historyFeeAmount.ts. */

export const HISTORY_FEE_ONLY_NOTE =
  'Network fee only. This is not a vault balance change.';

const GENERIC_ROW_TYPES = new Set(['sent', 'received', 'withdrawal']);

/**
 * Lovelace to show in a history amount cell when the vault's own net is zero.
 * Ordinary sent/received rows stay blank. Missing inputs or outputs stay blank
 * so a failed hydration is not reported as a fee.
 */
export function historyFeeOnlyLovelace(params: {
  transactionType?: string;
  netAssetCount: number;
  inputCount: number;
  outputCount: number;
  fee?: bigint;
}): bigint | undefined {
  const type = params.transactionType?.trim();
  if (!type || GENERIC_ROW_TYPES.has(type)) {
    return undefined;
  }
  if (params.netAssetCount !== 0 || params.inputCount <= 0 || params.outputCount <= 0) {
    return undefined;
  }
  if (params.fee === undefined || params.fee <= 0n) {
    return undefined;
  }
  return params.fee;
}
