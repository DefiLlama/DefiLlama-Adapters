const { sumTokensExport } = require("../helper/unwrapLPs");

/**
 * Configuration for Cian FBTCWrapper TVL calculation
 * Tracks LFBTC (lfbtc-cian-eth) tokens held in the FBTCWrapper contract
 */
const CONFIG = {
  ethereum: {
    FBTCWrapper: '0x821d2e44984168d278C698fD742d5138c01bAAA2',
    lfbtc: '0xc152d5a599f83b3d0098cbadb23fce95f27ff30b',
  }
};

module.exports = {
  methodology: 'Calculates TVL by summing LFBTC tokens held in the FBTCWrapper contract',
};

// Export TVL calculations for each configured chain
Object.entries(CONFIG).forEach(([chain, { FBTCWrapper, lfbtc }]) => {
  module.exports[chain] = {
    tvl: sumTokensExport({
      owners: [FBTCWrapper],
      tokens: [lfbtc],
    }),
  };
});
