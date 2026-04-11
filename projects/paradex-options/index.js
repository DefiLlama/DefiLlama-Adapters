// Paradex uses a unified USDC collateral bridge on Ethereum shared across
// all products (perps, spot, options). TVL is already reported by the main
// `paradex` adapter (wired to the `paradex-bridge` listing). This adapter
// re-exports it so the Paradex Options venue on DefiLlama reflects the same
// unified collateral pool. `doublecounted: true` prevents the shared USDC
// from being summed twice into aggregate DeFi TVL.
module.exports = {
  ...require('../paradex'),
  doublecounted: true,
  methodology: 'Paradex options share the unified USDC collateral bridge on Ethereum with Paradex perps and spot. TVL mirrors the main Paradex (Bridge) adapter; `doublecounted` prevents aggregation of the same pool twice.',
};
