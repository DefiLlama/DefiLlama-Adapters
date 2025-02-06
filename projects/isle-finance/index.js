const abi = {
  asset: "function asset() external view returns (address asset)",
  totalAssets: "function totalAssets() external view returns (uint256 totalAssets)",
};

const CONFIG = {
  hedera: [
    "0x53990bdEc017085153eB807236E744CA63C21fF4", // Wuren 
    "0xa605cA467E68dF89C59B5DEbAE71A24ce2863E91", // ChipRight Corp.
  ],
};

async function tvl(api, pools) {
  const [assets, totals] = await Promise.all([
    api.multiCall({ abi: abi.asset, calls: pools.map(p => ({ target: p })) }),
    api.multiCall({ abi: abi.totalAssets, calls: pools.map(p => ({ target: p })) }),
  ])
  api.addTokens(assets, totals)
}

module.exports = {
  methodology: "TVL of Isle Finance",
  start: 1750390800,  // 2025-06-20 11:40:00 GMT+8
  hedera: {
    tvl: (api) => tvl(api, CONFIG.hedera),
  },
}