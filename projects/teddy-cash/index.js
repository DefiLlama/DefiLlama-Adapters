const { getLiquityTvl } = require("../helper/liquity");

// Teddy Cash is a Liquity fork on Avalanche that mints the TSD stablecoin against
// native AVAX collateral. The TroveManager exposes activePool()/defaultPool(), which
// custody the AVAX deposited in Troves, so the standard Liquity helper applies directly.
const TROVE_MANAGER = "0xd22b04395705144Fd12AfFD854248427A2776194";

module.exports = {
  methodology:
    "TVL is the AVAX collateral deposited in Teddy Cash Troves, held by the ActivePool and DefaultPool and read via the TroveManager, following the standard Liquity model. The Stability Pool holds the protocol's own TSD stablecoin and is excluded to avoid counting debt as TVL.",
  start: "2021-08-26",
  avax: {
    tvl: getLiquityTvl(TROVE_MANAGER),
  },
};
