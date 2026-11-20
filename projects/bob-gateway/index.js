// BOB Gateway is an intents protocol: a solver fills BTC <-> USDT swaps from its own inventory and
// order escrow is only held for the minutes an order is in flight, so there is no pooled TVL.
// The V1-V4 gateways on BOB that this adapter used to track are retired.
// Activity is tracked as volume in dimension-adapters (dexs/bob-gateway).
module.exports = {
  methodology: "BOB Gateway holds no pooled liquidity: swaps are filled by a solver and settled on Ethereum. Activity is reported as volume.",
  bob: {
    tvl: () => ({}),
  },
};
