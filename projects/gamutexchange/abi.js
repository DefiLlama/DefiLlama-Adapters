const factory = require("./factory.json");

module.exports = {
  getPoolTokensAndBalances: "function getPoolTokensAndBalances() view returns (address[] tokens, uint256[] balances)",
  ...factory,
};
