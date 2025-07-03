const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  sonic: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0x8e1e17343b8e4f5e1baa868500163212e00366cc', '0x4f22f13828c27b6d8fdeac116155d1df15f31875'], // Y-wstkscUSD
        ['0xe8dcbc94a1a852e7f53713a0e927ef16d980b278', '0x4f22f13828c27b6d8fdeac116155d1df15f31875'], // P-wstkscUSD
      ],
    }),
  },
};
