const { aaveV2Export } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

const LPConfiguratorContract = "0xD07B62ee683267D4A884453eaE982A151653515E";

module.exports = {
  taiko: {
    ...aaveV2Export(LPConfiguratorContract, {
      fromBlock: 381054,
    }),
  },
};

module.exports.methodology = methodologies.lendingMarket;
