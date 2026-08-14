// DefiLlama TVL adapter for Aumo.
// Submit as projects/aumo/index.js in https://github.com/DefiLlama/DefiLlama-Adapters
//
// Aumo is an autonomous treasury agent for stablecoins on X Layer. Deposits sit in an ERC-4626
// vault (AumoPool) whose totalAssets() is the full USDT0 under management: the idle buffer plus
// principal deployed across allowlisted venues (Aave v3, USDG, Pendle PT). Counting totalAssets in
// USDT0 avoids double-counting the venue positions, since the vault already values them.

const POOL = "0x8a98A4A868e5FBAc05B9d1dC0742BD008354114F"; // AumoPool (ERC-4626), X Layer
const USDT0 = "0x779Ded0c9e1022225f8E0630b35a9b54bE713736"; // base asset, pegs to $1

async function tvl(api) {
  const assets = await api.call({ target: POOL, abi: "uint256:totalAssets" });
  api.add(USDT0, assets);
  return api.getBalances();
}

module.exports = {
  methodology:
    "TVL is the total USDT0 under management in the AumoPool ERC-4626 vault on X Layer, read from totalAssets() (idle buffer plus principal deployed across allowlisted venues).",
  xlayer: { tvl },
};
