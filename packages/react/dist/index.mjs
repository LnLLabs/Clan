import { useQuery as w, useQueryClient as y, useMutation as h } from "@tanstack/react-query";
import { jsx as g } from "react/jsx-runtime";
import { TransactionCreator as v, WalletDelegation as x } from "@clan/framework-components";
const Q = (e, i = {}) => {
  const { refetchInterval: t = 1e4, enabled: s = !0 } = i, a = e.getName();
  return w({
    queryKey: ["wallet", a, "balance"],
    queryFn: async () => await e.getBalance(),
    refetchInterval: t,
    enabled: s
  });
}, R = (e, i = {}) => {
  const { refetchInterval: t = 1e4, enabled: s = !0 } = i, a = e.getName();
  return w({
    queryKey: ["wallet", a, "utxos"],
    queryFn: async () => await e.getUtxos(),
    refetchInterval: t,
    enabled: s
  });
}, N = (e, i = {}) => {
  const { onSuccess: t, onError: s } = i, a = e.getName(), r = y();
  return h({
    mutationFn: async ({ recipientAddress: n, assets: l, options: d }) => {
      const c = await e.createTransaction(
        [{ address: n, assets: l }],
        d
      ), u = await e.signTransaction(c);
      return { txHash: await e.submitTransaction(u), draft: c, signedTx: u };
    },
    onSuccess: (n) => {
      r.invalidateQueries({ queryKey: ["wallet", a, "balance"] }), r.invalidateQueries({ queryKey: ["wallet", a, "utxos"] }), r.invalidateQueries({ queryKey: ["wallet", a, "transactions"] }), t == null || t(n);
    },
    onError: (n) => {
      s == null || s(n);
    }
  });
}, T = (e, i = {}) => {
  const { onSuccess: t, onError: s } = i, a = e.getName(), r = y();
  return h({
    mutationFn: async ({ poolId: n }) => {
      if (!e.createDelegationTransaction)
        throw new Error("Wallet does not support delegation transactions");
      const l = await e.createDelegationTransaction(n), d = await e.signTransaction(l);
      return { txHash: await e.submitTransaction(d), poolId: n };
    },
    onSuccess: (n) => {
      r.invalidateQueries({ queryKey: ["wallet", a, "balance"] }), r.invalidateQueries({ queryKey: ["wallet", a, "delegation"] }), r.invalidateQueries({ queryKey: ["wallet", a, "transactions"] }), t == null || t(n);
    },
    onError: (n) => {
      s == null || s(n);
    }
  });
}, W = (e, i = {}) => {
  const { refetchInterval: t = 3e4, enabled: s = !0 } = i, a = e.getName();
  return w({
    queryKey: ["wallet", a, "delegation"],
    queryFn: async () => {
      if (e.getDelegationInfo)
        return await e.getDelegationInfo();
    },
    refetchInterval: t,
    enabled: s
  });
}, p = (e, i = {}) => {
  const { onSuccess: t, onError: s } = i, a = e.getName(), r = y();
  return h({
    mutationFn: async () => {
      if (!e.withdrawRewards)
        throw new Error("Wallet does not support reward withdrawal");
      const n = e.getDelegationInfo ? await e.getDelegationInfo() : void 0, l = (n == null ? void 0 : n.rewards) || 0n, d = await e.withdrawRewards(), c = await e.signTransaction(d);
      return { txHash: await e.submitTransaction(c), amount: l };
    },
    onSuccess: (n) => {
      r.invalidateQueries({ queryKey: ["wallet", a, "balance"] }), r.invalidateQueries({ queryKey: ["wallet", a, "delegation"] }), r.invalidateQueries({ queryKey: ["wallet", a, "transactions"] }), t == null || t(n);
    },
    onError: (n) => {
      s == null || s(n);
    }
  });
}, C = ({
  wallet: e,
  metadataProvider: i,
  ...t
}) => /* @__PURE__ */ g(
  v,
  {
    wallet: e,
    metadataProvider: i,
    ...t
  }
), F = ({
  wallet: e,
  onSuccess: i,
  onError: t,
  className: s
}) => {
  const { data: a, isLoading: r } = W(e, {
    refetchInterval: 3e4,
    enabled: !0
  }), { mutateAsync: n, isPending: l } = T(e, {
    onSuccess: (o) => {
      console.log("Delegation successful:", o), i == null || i("delegate", o);
    },
    onError: (o) => {
      console.error("Delegation failed:", o), t == null || t(o);
    }
  }), { mutateAsync: d, isPending: c } = p(e, {
    onSuccess: (o) => {
      console.log("Withdrawal successful:", o), i == null || i("withdraw", o);
    },
    onError: (o) => {
      console.error("Withdrawal failed:", o), t == null || t(o);
    }
  }), u = a ? {
    stakeAddress: a.stakeAddress,
    delegatedPool: a.delegatedPool,
    delegatedDRep: a.delegatedDRep,
    // May not exist in older core types
    rewards: a.rewards,
    nextRewardEpoch: a.nextRewardEpoch
  } : void 0, f = async (o, q) => {
    o && await n({ poolId: o }), console.log("Delegation requested - Pool:", o, "dRep:", q);
  }, m = async () => {
    console.log("Undelegate not yet implemented"), t == null || t(new Error("Undelegate functionality not yet implemented"));
  }, D = async () => {
    await d();
  };
  return r ? /* @__PURE__ */ g("div", { className: "delegation-loading", children: "Loading delegation info..." }) : /* @__PURE__ */ g(
    x,
    {
      wallet: e,
      delegationInfo: u,
      onDelegate: f,
      onUndelegate: m,
      onWithdrawRewards: D,
      isDelegating: l,
      isWithdrawing: c,
      className: s
    }
  );
};
export {
  C as TransactionCreatorWithData,
  F as WalletDelegationWithData,
  T as useDelegateStake,
  N as useSendTransaction,
  Q as useWalletBalance,
  W as useWalletDelegation,
  R as useWalletUtxos,
  p as useWithdrawRewards
};
//# sourceMappingURL=index.mjs.map
