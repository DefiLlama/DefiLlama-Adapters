const constants = require("./constants");
const { staking } = require("../helper/staking");
// const { onChainTvl } = require("../helper/balancer");
const { sumTokensExport } = require("../helper/unwrapLPs");


module.exports = {
  boba: {
    // tvl: onChainTvl(constants.addresses.boba.vault, 668337),
    tvl: sumTokensExport({ owner: constants.addresses.boba.vault, tokens: Object.values(constants.addresses.boba.tokens)}),
    staking: staking(constants.addresses.boba.staking, constants.addresses.boba.tokens.KYO),
  },
  methodology:
    "Counts the tokens locked on swap pools based on their holdings.",
  hallmarks: [
    ['2022-06-28', "Boba adds to FRAX-USDC"],
    ['2022-07-21', "Boba removes from FRAX-USDC"],
    ['2022-07-29', "Boba adds to USDC-DAI"],
    ['2022-10-14', "Boba removes from USDC-DAI"]
  ],
};
