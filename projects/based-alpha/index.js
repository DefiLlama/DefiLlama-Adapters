// DefiLlama TVL adapter for Based Alpha (pump.fun-style launchpad on Robinhood Chain).
//
// Destination: DefiLlama-Adapters/projects/based-alpha/index.js
// Chain slug `robinhood` already exists in projects/helper/chains.json (chainId 4663).
//
// TVL = ETH sitting in the bonding curves: every live curve's reserves are
// custodied by the Launchpad proxy, so the proxy's native balance (plus any
// transient WETH dust from migrations) is the protocol's TVL. Graduated
// liquidity is intentionally excluded — it lives in Based DEX V3 pools and is
// counted by the DEX's own listing (no double counting).

const { sumTokensExport } = require("../helper/unwrapLPs");
const { nullAddress } = require("../helper/tokenMapping");

const LAUNCHPAD = "0x5640c62fe43a64f9ae0811114874e95a819db744"; // UUPS proxy, deploy block 10227218
const WETH9 = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73";

module.exports = {
  methodology:
    "TVL is the ETH held by the Launchpad contract, which custodies every live bonding curve's reserves (plus accrued, unclaimed protocol/creator fees and any transient WETH from migrations). Liquidity that has graduated to Based DEX V3 pools is excluded and counted under the DEX.",
  start: "2026-07-15",
  robinhood: {
    tvl: sumTokensExport({ owner: LAUNCHPAD, tokens: [nullAddress, WETH9] }),
  },
};
