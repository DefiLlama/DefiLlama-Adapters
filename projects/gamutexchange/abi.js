const factory = require("./factory.json");
const getPoolTokensAndBalances = require("./getPoolTokensAndBalances.json");

module.exports = {
  getPoolTokensAndBalances,
  ...factory,
};
