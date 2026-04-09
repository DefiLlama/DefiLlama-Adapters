const FACTORY = "0xBa270A620cafAA69a97AbcC4d83C850297ca05B2";

async function tvl(api) {
  // Get total token count from factory
  const tokenCount = await api.call({
    abi: "function getTokenCount() view returns (uint256)",
    target: FACTORY,
  });

  if (tokenCount === 0) return;

  // Get all token addresses in one paginated call
  const ids = Array.from({ length: Number(tokenCount) }, (_, i) => i + 1);
  const tokenAddresses = await api.multiCall({
    abi: "function getToken(uint256) view returns (address)",
    target: FACTORY,
    calls: ids,
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
    "TVL is the sum of realTaoReserve (native TAO locked in the bonding curve) across all tokens deployed by the brain.fun factory contract.",
  start: 1742832000, // 2026-03-31 — first token deploy
  bittensor_evm: {
    tvl,
  },
};
