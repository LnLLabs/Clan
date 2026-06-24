import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { CreateDelegationOptions, WalletInterface } from '@clan/framework-core';

export interface DelegateStakeParams {
  poolId?: string;
  drepId?: string;
  /** When true with both pool and dRep, submit pool-only then dRep-only in one mutation (one pending state). */
  sequential?: boolean;
}

export interface DelegateStakeResult {
  txHash: string;
  poolId?: string;
  drepId?: string;
  /** First tx hash when {@link DelegateStakeParams.sequential} was used. */
  poolTxHash?: string;
}

export interface UseDelegateStakeOptions {
  onSuccess?: (data: DelegateStakeResult) => void;
  onError?: (error: Error) => void;
}

function toDelegationOptions(params: Pick<DelegateStakeParams, 'poolId' | 'drepId'>): CreateDelegationOptions {
  const poolId = params.poolId?.trim() || undefined;
  const drepId = params.drepId?.trim() || undefined;
  if (!poolId && !drepId) {
    throw new Error('At least one of poolId or drepId is required for delegation.');
  }
  return { poolId, drepId };
}

async function submitDelegationTx(
  wallet: WalletInterface,
  options: CreateDelegationOptions
): Promise<DelegateStakeResult> {
  if (!wallet.createDelegationTransaction) {
    throw new Error('Wallet does not support delegation transactions');
  }
  const draft = await wallet.createDelegationTransaction(options);
  const signedTx = await wallet.signTransaction(draft);
  const txHash = await wallet.submitTransaction(signedTx);
  return {
    txHash,
    poolId: options.poolId,
    drepId: options.drepId,
  };
}

/**
 * Build, sign, and submit delegation transaction(s).
 * Use from apps that do not use {@link useDelegateStake}; callers must invalidate caches as needed.
 */
export async function delegateStakeWithWallet(
  wallet: WalletInterface,
  params: DelegateStakeParams
): Promise<DelegateStakeResult> {
  if (!wallet.createDelegationTransaction) {
    throw new Error('Wallet does not support delegation transactions');
  }
  if (params.sequential) {
    const poolId = params.poolId?.trim();
    const drepId = params.drepId?.trim();
    if (!poolId || !drepId) {
      throw new Error('Sequential delegation requires both poolId and drepId.');
    }
    const pool = await submitDelegationTx(wallet, toDelegationOptions({ poolId }));
    const drep = await submitDelegationTx(wallet, toDelegationOptions({ drepId }));
    return {
      txHash: drep.txHash,
      poolTxHash: pool.txHash,
      poolId,
      drepId,
    };
  }
  const delegationOptions = toDelegationOptions(params);
  return submitDelegationTx(wallet, delegationOptions);
}

/**
 * Submit pool-only then dRep-only delegation as two sequential transactions
 * (required when the wallet cannot combine both certs in one build step).
 */
export async function executeDelegateStakeSequential(
  wallet: WalletInterface,
  poolId: string,
  drepId: string
): Promise<{ pool: DelegateStakeResult; drep: DelegateStakeResult }> {
  if (!wallet.createDelegationTransaction) {
    throw new Error('Wallet does not support delegation transactions');
  }
  const pool = await submitDelegationTx(wallet, toDelegationOptions({ poolId }));
  const drep = await submitDelegationTx(wallet, toDelegationOptions({ drepId }));
  return { pool, drep };
}

/**
 * React Query mutation hook for delegating stake to a pool and/or dRep
 * Automatically invalidates balance and delegation info on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export const useDelegateStake = (
  wallet: WalletInterface,
  options: UseDelegateStakeOptions = {}
): UseMutationResult<DelegateStakeResult, Error, DelegateStakeParams> => {
  const { onSuccess, onError } = options;
  const walletId = wallet.getName();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DelegateStakeParams) => delegateStakeWithWallet(wallet, params),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'delegation'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'transactions'] });
      onSuccess?.(data);
    },

    onError: (error: Error) => {
      onError?.(error);
    },
  });
};
