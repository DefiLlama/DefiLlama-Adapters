const { aaveV2Export } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

const LPConfiguratorContract = "0xD07B62ee683267D4A884453eaE982A151653515E";
const blacklistedTokens = ['0xf7fb2df9280eb0a76427dc3b34761db8b1441a49'] // M-BTC

module.exports = {
  taiko: {
    ...aaveV2Export(LPConfiguratorContract, {
      fromBlock: 381054,
      blacklistedTokens
    }),
  },
};

module.exports.methodology = methodologies.lendingMarket;
