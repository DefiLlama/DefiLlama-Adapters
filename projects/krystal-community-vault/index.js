const community = require("./community.js");

Object.keys(community.config).forEach(chain => {
  module.exports[chain] = { tvl: community.tvl };
});

module.exports.methodology =
  "Sum of the liquidity positions and token balances held in every Community Vault, each a " +
  "publicly depositable vault whose owner actively manages LP positions across 2-4 tokens.";
