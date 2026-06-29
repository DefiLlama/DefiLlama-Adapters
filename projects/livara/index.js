const { sumTokensExport } = require("../helper/unwrapLPs");

// USDT (PoS) on Polygon
const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";

// LivaraPoolsEscrow contract — holds USDT for all open prediction pools
const ESCROW_CONTRACT = "0x2883C739871CE6900Bf4b60Ecc979354613148e2";

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
