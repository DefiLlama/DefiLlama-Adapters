const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

// EventTrader - AI-powered perpetual prediction market on Base
// Exchange contract holds USDC collateral for all active markets
const EXCHANGE_CONTRACT = "0x6dC111ffB79ba7C892665329c10C2035119C91bf";

module.exports = {
  methodology: "TVL is the total USDC collateral locked in EventTrader prediction market contracts on Base",
  base: {
    tvl: sumTokensExport({
      owners: [EXCHANGE_CONTRACT],
      tokens: [ADDRESSES.base.USDC],
    }),
  },
};
