import { useQuery as m, useQueryClient as v, useMutation as x } from "@tanstack/react-query";
import { jsx as d, jsxs as D } from "react/jsx-runtime";
import { useState as A, useEffect as T } from "react";
import { TransactionCreator as W, convertAssetsToAssetArray as I, convertAssetsToAssetArraySync as p, WalletDelegation as K } from "@clan/framework-components";
const N = (e, s = {}) => {
  const { refetchInterval: t = 1e4, enabled: i = !0 } = s, a = e.getName();
  return m({
    queryKey: ["wallet", a, "balance"],
    queryFn: async () => await e.getBalance(),
    refetchInterval: t,
    enabled: i
  });
}, Q = (e, s = {}) => {
  const { refetchInterval: t = 1e4, enabled: i = !0 } = s, a = e.getName();
  return m({
    queryKey: ["wallet", a, "utxos"],
    queryFn: async () => await e.getUtxos(),
    refetchInterval: t,
    enabled: i
  });
}, j = (e, s = {}) => {
  const { onSuccess: t, onError: i } = s, a = e.getName(), r = v();
  return x({
    mutationFn: async ({ recipientAddress: n, assets: c, options: l }) => {
      const u = await e.createTransaction(
        [{ address: n, assets: c }],
        l
      ), g = await e.signTransaction(u);
      return { txHash: await e.submitTransaction(g), draft: u, signedTx: g };
    },
    onSuccess: (n) => {
      r.invalidateQueries({ queryKey: ["wallet", a, "balance"] }), r.invalidateQueries({ queryKey: ["wallet", a, "utxos"] }), r.invalidateQueries({ queryKey: ["wallet", a, "transactions"] }), t == null || t(n);
    },
    onError: (n) => {
      i == null || i(n);
    }
  });
}, L = (e, s = {}) => {
  const { onSuccess: t, onError: i } = s, a = e.getName(), r = v();
  return x({
    mutationFn: async ({ poolId: n }) => {
      if (!e.createDelegationTransaction)
        throw new Error("Wallet does not support delegation transactions");
      const c = await e.createDelegationTransaction(n), l = await e.signTransaction(c);
      return { txHash: await e.submitTransaction(l), poolId: n };
    },
    onSuccess: (n) => {
      r.invalidateQueries({ queryKey: ["wallet", a, "balance"] }), r.invalidateQueries({ queryKey: ["wallet", a, "delegation"] }), r.invalidateQueries({ queryKey: ["wallet", a, "transactions"] }), t == null || t(n);
    },
    onError: (n) => {
      i == null || i(n);
    }
  });
}, R = (e, s = {}) => {
  const { refetchInterval: t = 3e4, enabled: i = !0 } = s, a = e.getName();
  return m({
    queryKey: ["wallet", a, "delegation"],
    queryFn: async () => {
      if (e.getDelegationInfo)
        return await e.getDelegationInfo();
    },
    refetchInterval: t,
    enabled: i
  });
}, F = (e, s = {}) => {
  const { onSuccess: t, onError: i } = s, a = e.getName(), r = v();
  return x({
    mutationFn: async () => {
      if (!e.withdrawRewards)
        throw new Error("Wallet does not support reward withdrawal");
      const n = e.getDelegationInfo ? await e.getDelegationInfo() : void 0, c = (n == null ? void 0 : n.rewards) || 0n, l = await e.withdrawRewards(), u = await e.signTransaction(l);
      return { txHash: await e.submitTransaction(u), amount: c };
    },
    onSuccess: (n) => {
      r.invalidateQueries({ queryKey: ["wallet", a, "balance"] }), r.invalidateQueries({ queryKey: ["wallet", a, "delegation"] }), r.invalidateQueries({ queryKey: ["wallet", a, "transactions"] }), t == null || t(n);
    },
    onError: (n) => {
      i == null || i(n);
    }
  });
}, B = ({
  wallet: e,
  metadataProvider: s,
  refetchInterval: t = 1e4,
  ...i
}) => {
  const [a, r] = A([]), [n, c] = A(!1), { data: l, isLoading: u, error: g } = N(e, {
    refetchInterval: t,
    enabled: !0
  }), { data: y, isLoading: f, error: h } = Q(e, {
    refetchInterval: t,
    enabled: !0
  });
  return T(() => {
    if (!l) return;
    (async () => {
      c(!0);
      try {
        if (s) {
          const w = await I(
            l,
            async (b) => {
              try {
                return await s.getMetadata(b);
              } catch (q) {
                return console.warn(`Failed to fetch metadata for ${b}:`, q), {};
              }
            }
          );
          r(w);
        } else {
          const w = p(l);
          r(w);
        }
      } catch (w) {
        console.error("Error enriching assets:", w), r(p(l));
      } finally {
        c(!1);
      }
    })();
  }, [l, s]), u || f ? /* @__PURE__ */ d("div", { className: "transaction-creator-loading", style: { padding: "2rem", textAlign: "center" }, children: /* @__PURE__ */ d("div", { children: "Loading wallet data..." }) }) : g || h ? /* @__PURE__ */ D("div", { className: "transaction-creator-error", style: { padding: "2rem", color: "#ef4444" }, children: [
    /* @__PURE__ */ d("div", { children: "Error loading wallet data" }),
    g && /* @__PURE__ */ d("div", { children: g.message }),
    h && /* @__PURE__ */ d("div", { children: h.message })
  ] }) : !y || y.length === 0 ? /* @__PURE__ */ d("div", { className: "transaction-creator-no-utxos", style: { padding: "2rem", textAlign: "center" }, children: /* @__PURE__ */ d("div", { children: "No funds available in wallet" }) }) : /* @__PURE__ */ d(
    W,
    {
      wallet: e,
      availableUtxos: y,
      availableAssets: a,
      ...i
    }
  );
}, E = ({
  wallet: e,
  onSuccess: s,
  onError: t,
  className: i
}) => {
  const { data: a, isLoading: r } = R(e, {
    refetchInterval: 3e4,
    enabled: !0
  }), { mutateAsync: n, isPending: c } = L(e, {
    onSuccess: (o) => {
      console.log("Delegation successful:", o), s == null || s("delegate", o);
    },
    onError: (o) => {
      console.error("Delegation failed:", o), t == null || t(o);
    }
  }), { mutateAsync: l, isPending: u } = F(e, {
    onSuccess: (o) => {
      console.log("Withdrawal successful:", o), s == null || s("withdraw", o);
    },
    onError: (o) => {
      console.error("Withdrawal failed:", o), t == null || t(o);
    }
  }), g = a ? {
    stakeAddress: a.stakeAddress,
    delegatedPool: a.delegatedPool,
    rewards: a.rewards,
    activeEpoch: a.activeEpoch,
    nextRewardEpoch: a.nextRewardEpoch
  } : void 0, y = async (o) => {
    await n({ poolId: o });
  }, f = async () => {
    console.log("Undelegate not yet implemented"), t == null || t(new Error("Undelegate functionality not yet implemented"));
  }, h = async () => {
    await l();
  };
  return r ? /* @__PURE__ */ d("div", { className: "delegation-loading", children: "Loading delegation info..." }) : /* @__PURE__ */ d(
    K,
    {
      wallet: e,
      delegationInfo: g,
      onDelegate: y,
      onUndelegate: f,
      onWithdrawRewards: h,
      isDelegating: c,
      isWithdrawing: u,
      className: i
    }
  );
};
export {
  B as TransactionCreatorWithData,
  E as WalletDelegationWithData,
  L as useDelegateStake,
  j as useSendTransaction,
  N as useWalletBalance,
  R as useWalletDelegation,
  Q as useWalletUtxos,
  F as useWithdrawRewards
};
//# sourceMappingURL=index.mjs.map
