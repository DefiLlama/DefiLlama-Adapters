const { sumTokensExport } = require("../helper/unwrapLPs");

const BCHEM = "0x9102E0A76a5e2823073Ed763a32Ba8ca8521b1F3";
const STAKING = "0x01F82039810f18F703F4c8b943940ce04Fa00C78";

module.exports = {
  methodology:
    "Counts BCHEM held by the Bitchemical staking contract on BNB Chain. Core TVL is exported as empty to avoid double-counting protocol assets.",
  bsc: {
    tvl: () => ({}),
    staking: sumTokensExport({
      owner: STAKING,
      tokens: [BCHEM],
    }),
  },
};
