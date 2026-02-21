// COMRAIL — Commodity Index Vaults on HyperEVM
// https://comrail.xyz
//
// Users deposit USDC into ERC-4626 vaults that trade commodity perpetual futures
// (gold, silver, platinum, oil, natural gas) on Hyperliquid.

const VAULT_ADDRESSES = [
  "0x8F6034Fe423f696DB08fB8C536B88D9B9389dE34", // Metals Vault
  "0xfE937fED2219D06e2BAD986933ea96065D8BE177", // Energy Vault
  "0xe626CFC0395719D59dA210270051a9A03C210bdd", // Broad Vault
];

const USDC = "0xb88339CB7199b77E23DB6E890353E22632Ba630f";

async function tvl(api) {
  const totalAssets = await api.multiCall({
    abi: "function totalAssets() view returns (uint256)",
    calls: VAULT_ADDRESSES,
  });

  for (const assets of totalAssets) {
    api.add(USDC, assets);
  }
}

module.exports = {
  methodology:
    "TVL is the sum of totalAssets() across all COMRAIL ERC-4626 vaults on HyperEVM. Each vault holds USDC and trades commodity perpetual futures on Hyperliquid.",
  hyperliquid: {
    tvl,
  },
};
