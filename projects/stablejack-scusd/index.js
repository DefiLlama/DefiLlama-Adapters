const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const STABLEJACK_SONIC_CONTRACT = "0xf41ECda82C54745aF075B79b6b31a18dD986BA4c";

module.exports = {
  sonic: {
    tvl: sumTokensExport({ owner: STABLEJACK_SONIC_CONTRACT, tokens: [ADDRESSES.sonic.scUSD]}),
  },
};
