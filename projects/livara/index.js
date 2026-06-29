const { sumTokensExport } = require("../helper/unwrapLPs");

// USDT (PoS) on Polygon
const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";

// LivaraPoolsEscrow contract — holds USDT for all open prediction pools
const ESCROW_CONTRACT = "0xdC1359F9A5F80Feded5a7811e03148e773eAa2af";

module.exports = {
  methodology:
    "TVL is the total USDT locked in the LivaraPoolsEscrow smart contract on Polygon, " +
    "representing funds held across all open prediction pools awaiting settlement.",

  polygon: {
    tvl: sumTokensExport({
      owners: [ESCROW_CONTRACT],
      tokens: [USDT],
    }),
  },
};
