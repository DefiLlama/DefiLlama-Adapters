const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  sonic: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0x8e1e17343b8e4f5e1baa868500163212e00366cc', '0x13b435b9efe154ffc39eea7fe41dd6ded1fd96e6'], // Y-wstkscUSD
        ['0xe8dcbc94a1a852e7f53713a0e927ef16d980b278', '0x13b435b9efe154ffc39eea7fe41dd6ded1fd96e6'], // P-wstkscUSD
      ],
    }),
  },
};
