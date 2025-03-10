const { uniTvlExport } = require("../helper/calculateUniTvl.js");

// The uniTvlExport function is used to export the TVL for the specified Uniswap V2 factory.
module.exports = {
  // The misrepresentedTokens property indicates that the tokens in the TVL calculation may be misrepresented.
  misrepresentedTokens: true,
  start: '2022-11-06',
  arbitrum: {
    tvl: uniTvlExport("0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218", "arbitrum", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, }),
  },
  // The hallmarks property lists significant events that have impacted the protocol.
  hallmarks: [[1668038400, "Emissions started"]],
};
