const ADDRESSES = require('../helper/coreAssets.json');

const STAKING_CONTRACTS = [
  "0x84a800F9e44E0b48b4055e45EbE42710e37e216F",
  "0x53bcC6BF7b1345828777027027f94EB9a7075f99",
];

module.exports = {
  methodology:
    "TVL is calculated by summing the native KUB balances held in BlueBox staking and reward contracts where users deposit funds.",

  bitkub: {
    tvl: async (api) => {
      if (!STAKING_CONTRACTS.length)
        throw new Error("No staking contracts configured");

      return api.sumTokens({
        owners: STAKING_CONTRACTS,
        tokens: [ADDRESSES.null],
      });
    },
  },
};
  