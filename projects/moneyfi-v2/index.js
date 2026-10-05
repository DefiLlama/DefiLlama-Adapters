const V2_BSC_VAULTS = [
  "0xC45f0c6a22dd5bA2fa75b803bBabc67CC212838c",
  "0xBC96E51AE3A3D0A32091396339a0c2B68DF97e2A",
  "0xf3400439439c911952E9949B6A522Ed78504A253",
];

async function tvl(api) {
  const assets = await api.multiCall({ abi: "address:asset", calls: V2_BSC_VAULTS });
  const [grossManagedAssets, pendingDepositAssets, reservedRedeemAssets] = await Promise.all([
    api.multiCall({ abi: "uint256:grossManagedAssets", calls: V2_BSC_VAULTS }),
    api.multiCall({ abi: "uint256:pendingDepositAssets", calls: V2_BSC_VAULTS }),
    api.multiCall({ abi: "uint256:reservedRedeemAssets", calls: V2_BSC_VAULTS }),
  ]);

  V2_BSC_VAULTS.forEach((_, index) => {
    // grossManagedAssets already includes active funds held by the Vault,
    // curator, off-chain strategy, and transit layer. Only the two excluded
    // custody buckets are added separately.
    api.add(assets[index], grossManagedAssets[index]);
    api.add(assets[index], pendingDepositAssets[index]);
    api.add(assets[index], reservedRedeemAssets[index]);
  });
}

module.exports = {
  bsc: { tvl },
  start: "2026-08-02",
  methodology:
    "TVL includes assets managed by MoneyFi V2 vaults reported by the grossManagedAssets function of each vault, pending deposits and reserved redemptions are also included.",
};
