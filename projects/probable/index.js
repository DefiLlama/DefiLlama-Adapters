const { sumTokensExport } = require("../helper/unwrapLPs");

const TREASURY = "0x364d05055614B506e2b9A287E4ac34167204cA83";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

module.exports = {
  bsc: {
    tvl: sumTokensExport({ tokens: [USDT], owner: TREASURY }),
  },
};
