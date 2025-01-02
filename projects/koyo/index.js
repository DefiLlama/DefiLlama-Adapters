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
    [1656419883, "Boba adds to FRAX-USDC"],
    [1658439731, "Boba removes from FRAX-USDC"],
    [1659129231, "Boba adds to USDC-DAI"],
    [1665774187, "Boba removes from USDC-DAI"]
  ],
};
