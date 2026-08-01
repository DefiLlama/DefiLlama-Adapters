const abi = {
    asset: "function asset() external view returns (address asset)",
    totalAssets: "function totalAssets() external view returns (uint256 totalAssets)",
};

const CONFIG = {
    hedera: [
        { pool: "0x53990bdEc017085153eB807236E744CA63C21fF4", start: 1752141632 }, // Wuren,           2025-07-10 18:00:32 GMT+8
        { pool: "0xa605cA467E68dF89C59B5DEbAE71A24ce2863E91", start: 1758859076 }, // ChipRight Corp.  2025-09-26 11:57:56 GMT+8
    ],
};

async function tvl(api, pools) {
    const timestamp = api.timestamp
    const activePools = pools
        .filter(p => !p.start || timestamp >= p.start)
        .map(p => p.pool)

    if (!activePools.length) return

    const calls = activePools.map(p => ({ target: p }))
    const [assets, totals] = await Promise.all([
        api.multiCall({ abi: abi.asset, calls }),
        api.multiCall({ abi: abi.totalAssets, calls }),
    ])
    api.addTokens(assets, totals)
}

module.exports = {
    methodology: "TVL of Isle Finance",
    start: 1752141632,  // 2025-07-10 18:00:32 GMT+8
    hedera: {
        tvl: (api) => tvl(api, CONFIG.hedera),
    },
}