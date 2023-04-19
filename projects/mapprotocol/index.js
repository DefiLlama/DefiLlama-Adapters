const { sumTokensExport } = require("../helper/sumTokens");
const config = require("./config");

module.exports = {};

Object.keys(config).forEach(chain => {
  const { mosContract, tokens } = config[chain];
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: mosContract, tokens: Object.values(tokens) })
  };
});
