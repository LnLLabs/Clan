import { useQuery as A, useQueryClient as w, useMutation as p } from "@tanstack/react-query";
import { jsx as n, jsxs as T } from "react/jsx-runtime";
import { useState as m, useEffect as q } from "react";
import { TransactionCreator as E, convertAssetsToAssetArray as N, convertAssetsToAssetArraySync as x } from "@clan/framework-components";
const K = (e, a = {}) => {
  const { refetchInterval: t = 1e4, enabled: r = !0 } = a, s = e.getName();
  return A({
    queryKey: ["wallet", s, "balance"],
    queryFn: async () => await e.getBalance(),
    refetchInterval: t,
    enabled: r
  });
}, L = (e, a = {}) => {
  const { refetchInterval: t = 1e4, enabled: r = !0 } = a, s = e.getName();
  return A({
    queryKey: ["wallet", s, "utxos"],
    queryFn: async () => await e.getUtxos(),
    refetchInterval: t,
    enabled: r
  });
}, U = (e, a = {}) => {
  const { onSuccess: t, onError: r } = a, s = e.getName(), i = w();
  return p({
    mutationFn: async ({ recipientAddress: c, assets: d, options: o }) => {
      const y = await e.createTransaction(
        [{ address: c, assets: d }],
        o
      ), l = await e.signTransaction(y);
      return { txHash: await e.submitTransaction(l), draft: y, signedTx: l };
    },
    onSuccess: (c) => {
      i.invalidateQueries({ queryKey: ["wallet", s, "balance"] }), i.invalidateQueries({ queryKey: ["wallet", s, "utxos"] }), i.invalidateQueries({ queryKey: ["wallet", s, "transactions"] }), t == null || t(c);
    },
    onError: (c) => {
      r == null || r(c);
    }
  });
}, W = ({
  wallet: e,
  metadataProvider: a,
  refetchInterval: t = 1e4,
  ...r
}) => {
  const [s, i] = m([]), [c, d] = m(!1), { data: o, isLoading: y, error: l } = K(e, {
    refetchInterval: t,
    enabled: !0
  }), { data: g, isLoading: v, error: h } = L(e, {
    refetchInterval: t,
    enabled: !0
  });
  return q(() => {
    if (!o) return;
    (async () => {
      d(!0);
      try {
        if (a) {
          const u = await N(
            o,
            async (f) => {
              try {
                return await a.getMetadata(f);
              } catch (b) {
                return console.warn(`Failed to fetch metadata for ${f}:`, b), {};
              }
            }
          );
          i(u);
        } else {
          const u = x(o);
          i(u);
        }
      } catch (u) {
        console.error("Error enriching assets:", u), i(x(o));
      } finally {
        d(!1);
      }
    })();
  }, [o, a]), y || v ? /* @__PURE__ */ n("div", { className: "transaction-creator-loading", style: { padding: "2rem", textAlign: "center" }, children: /* @__PURE__ */ n("div", { children: "Loading wallet data..." }) }) : l || h ? /* @__PURE__ */ T("div", { className: "transaction-creator-error", style: { padding: "2rem", color: "#ef4444" }, children: [
    /* @__PURE__ */ n("div", { children: "Error loading wallet data" }),
    l && /* @__PURE__ */ n("div", { children: l.message }),
    h && /* @__PURE__ */ n("div", { children: h.message })
  ] }) : !g || g.length === 0 ? /* @__PURE__ */ n("div", { className: "transaction-creator-no-utxos", style: { padding: "2rem", textAlign: "center" }, children: /* @__PURE__ */ n("div", { children: "No funds available in wallet" }) }) : /* @__PURE__ */ n(
    E,
    {
      wallet: e,
      availableUtxos: g,
      availableAssets: s,
      ...r
    }
  );
};
export {
  W as TransactionCreatorWithData,
  U as useSendTransaction,
  K as useWalletBalance,
  L as useWalletUtxos
};
//# sourceMappingURL=index.mjs.map
