// DefiLlama adapter for LoopFi
// https://loopfi.site
// ERC-4626 yield vaults on BSC, Arbitrum and Avalanche

const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");

// ── Vault addresses ────────────────────────────────────────────────────────────
const VAULTS = {
  bsc: [
    "0xE486C62145ba4Cf83aBc186c60b175b132F41c19", // Stable Yield 3x (USDT)
  ],
  arbitrum: [
    "0x466d5d9f5eff81C894D3B9dfF8E54D9D334c27d5", // ETH Yield 3x (WETH)
    "0x1e9102AbDFEedfDFDA1D250600e9A1271fc6cd6C", // USDC Compound Yield
  ],
  avax: [
    "0xD67DBfFa04298ec8a0e8119d1f3170164f8c8E6A", // sAVAX Yield 2x (WAVAX)
    "0xdA898Ca31bD7563B7fD308b633631a4B28809DE8", // USDT Benqi Yield
  ],
};

// ERC-4626 ABI — totalAssets() returns TVL in underlying token
const VAULT_ABI = "function totalAssets() view returns (uint256)";
const ASSET_ABI  = "function asset() view returns (address)";

async function tvl(chain, vaults, api) {
  const assets = await api.multiCall({
    calls: vaults.map(v => ({ target: v })),
    abi: ASSET_ABI,
    chain,
  });

  const totals = await api.multiCall({
    calls: vaults.map(v => ({ target: v })),
    abi: VAULT_ABI,
    chain,
  });

  totals.forEach((total, i) => {
    api.add(assets[i], total);
  });
}

module.exports = {
  methodology: "TVL is the sum of totalAssets() across all ERC-4626 vaults on BSC, Arbitrum and Avalanche.",
  bsc: {
    tvl: (api) => tvl("bsc", VAULTS.bsc, api),
  },
  arbitrum: {
    tvl: (api) => tvl("arbitrum", VAULTS.arbitrum, api),
  },
  avax: {
    tvl: (api) => tvl("avax", VAULTS.avax, api),
  },
};
