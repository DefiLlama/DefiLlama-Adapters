const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const TREASURY = "0x364d05055614B506e2b9A287E4ac34167204cA83";
const USDT = ADDRESSES.bsc.USDT;

module.exports = {
  bsc: {
    tvl: sumTokensExport({ tokens: [USDT], owner: TREASURY }),
  },
};
