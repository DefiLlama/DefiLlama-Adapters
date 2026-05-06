const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

// EventTrader - AI prediction markets on Base L2
// These contracts hold USDC collateral for active prediction markets
const ARENA_SETTLEMENT = "0x5Ce06F6692e045089FeE521534C50F79e07b89fB";
const CLOB_SETTLEMENT = "0x9d4dFbdF0fa05B5657Efe601db9A99A1F7c71500";

module.exports = {
  methodology: "TVL is the total USDC collateral locked in EventTrader prediction market and CLOB settlement contracts on Base.",
  base: {
    tvl: sumTokensExport({
      owners: [ARENA_SETTLEMENT, CLOB_SETTLEMENT],
      tokens: [ADDRESSES.base.USDC],
    }),
  },
};
