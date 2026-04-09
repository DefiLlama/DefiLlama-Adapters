const FACTORIES = [
  "0xBa270A620cafAA69a97AbcC4d83C850297ca05B2", // V1 — legacy factory
  "0x3EDFEdaFa3dAd70a3F72EdB8be8e818d1922E04c", // V2 — current factory
];

async function tvl(api) {
  // Get token count from each factory in parallel
  const tokenCounts = await api.multiCall({
    abi: "function getTokenCount() view returns (uint256)",
    calls: FACTORIES,
  });

  // Build (factory, tokenId) call list across all factories
  const tokenIdCalls = [];
  FACTORIES.forEach((factory, i) => {
    const count = Number(tokenCounts[i]);
    for (let id = 1; id <= count; id++) {
      tokenIdCalls.push({ target: factory, params: [id] });
    }
  });

  if (tokenIdCalls.length === 0) return;

  // Resolve every token address from every factory in one batch
  const tokenAddresses = await api.multiCall({
    abi: "function getToken(uint256) view returns (address)",
    calls: tokenIdCalls,
  });

  // Read realTaoReserve from each token (native TAO locked in bonding curves)
  const reserves = await api.multiCall({
    abi: "function realTaoReserve() view returns (uint256)",
    calls: tokenAddresses,
  });

  // Sum all reserves as native gas token (TAO)
  reserves.forEach((reserve) => {
    api.addGasToken(reserve);
  });
}

module.exports = {
  methodology:
    "TVL is the sum of realTaoReserve (native TAO locked in the bonding curve) across all tokens deployed by the brain.fun factory contracts (V1 + V2).",
  start: 1774915200, // 2026-03-31 — first token deploy
  bittensor_evm: {
    tvl,
  },
};
