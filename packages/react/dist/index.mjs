import { useQuery as o, useQueryClient as d, useMutation as w } from "@tanstack/react-query";
const b = (e, r) => {
  const { walletId: t, refetchInterval: a = 1e4, enabled: n = !0 } = r;
  return o({
    queryKey: ["wallet", t, "balance"],
    queryFn: async () => await e.getBalance(),
    refetchInterval: a,
    enabled: n
  });
}, v = (e, r) => {
  const { walletId: t, refetchInterval: a = 1e4, enabled: n = !0 } = r;
  return o({
    queryKey: ["wallet", t, "utxos"],
    queryFn: async () => await e.getUtxos(),
    refetchInterval: a,
    enabled: n
  });
}, I = (e, r) => {
  const { walletId: t, onSuccess: a, onError: n } = r, u = d();
  return w({
    mutationFn: async ({ recipientAddress: s, assets: c, options: y }) => {
      const l = await e.createTransaction(
        [{ address: s, assets: c }],
        y
      ), i = await e.signTransaction(l);
      return { txHash: await e.submitTransaction(i), draft: l, signedTx: i };
    },
    onSuccess: (s) => {
      u.invalidateQueries({ queryKey: ["wallet", t, "balance"] }), u.invalidateQueries({ queryKey: ["wallet", t, "utxos"] }), u.invalidateQueries({ queryKey: ["wallet", t, "transactions"] }), a == null || a(s);
    },
    onError: (s) => {
      n == null || n(s);
    }
  });
};
export {
  I as useSendTransaction,
  b as useWalletBalance,
  v as useWalletUtxos
};
//# sourceMappingURL=index.mjs.map
