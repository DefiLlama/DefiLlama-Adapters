// Nexion Prediction Markets (PulseBet) on PulseChain
// Factory deploys EIP-1167 minimal proxy markets with collateral that earns yield in lending pools

const PREDICTION_FACTORY = "0x0f93380bb3442E6c7fE56f92d8193C6C39a0dC37";

/**
 * Calculates TVL across all prediction markets by enumerating them
 * from the on-chain factory and summing collateral balances.
 * Collateral sits in market contracts + lending pools (PoolV3).
 */
async function tvl(api) {
  // Get all market addresses from factory
  const marketCount = await api.call({
    abi: 'uint256:getMarketsCount',
    target: PREDICTION_FACTORY,
  });

  if (marketCount === 0 || marketCount === '0') return;

  const markets = await api.call({
    abi: 'function getMarkets(uint256 offset, uint256 limit) view returns (address[])',
    target: PREDICTION_FACTORY,
    params: [0, marketCount],
  });

  if (!markets.length) return;

  // For each market, get collateral token and total value (balance + lending)
  const [collaterals, values] = await Promise.all([
    api.multiCall({ abi: 'address:collateral', calls: markets, permitFailure: true }),
    api.multiCall({ abi: 'uint256:getTotalValue', calls: markets, permitFailure: true }),
  ]);

  values.forEach((val, i) => {
    if (val && val !== '0' && collaterals[i]) {
      api.add(collaterals[i], val);
    }
  });
}

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the total collateral locked across all Nexion prediction markets. Marked as doublecounted because market collateral earns yield in GLOW lending pools (tracked by nexion-lending). Markets are discovered dynamically from the on-chain factory.",
  pulse: {
    tvl,
  },
};
