const { staking } = require("../helper/staking");

const BCHEM = "0x9102E0A76a5e2823073Ed763a32Ba8ca8521b1F3";
const STAKING_CONTRACT = "0x01F82039810f18F703F4c8b943940ce04Fa00C78";

module.exports = {
  methodology:
    "Counts BCHEM tokens locked in Bitchemical staking on BNB Chain.",
  start: 1735689600,
  bsc: {
    staking: staking(STAKING_CONTRACT, BCHEM),
  },
};
