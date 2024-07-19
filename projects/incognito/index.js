const config = require("./config");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "Calculates the quantity of tokens held within Incognito contracts.",
};

config.chains.forEach((chainInfo) => {
  const { name: chain, tokens, holders } = chainInfo;
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokens, owners: holders }),
  };
});
