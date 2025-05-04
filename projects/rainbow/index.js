const ADDRESSES = require('../helper/coreAssets.json')
const { view_account, getTokenBalance, sumTokens } = require("../helper/chain/near");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: sumTokensExport({
      owner: "0x6BFaD42cFC4EfC96f529D786D643Ff4A8B89FA52",
      fetchCoValentTokens: true,
      logCalls: true,
    }),
  },
  /* aurora: {
    tvl: sumTokensExport({
      owner: "0xb0bD02F6a392aF548bDf1CfAeE5dFa0EefcC8EaB",
      tokens: [ADDRESSES.null],
      logCalls: true,
    }),
  }, */
  near: {
    tvl: async () => {
      return sumTokens({ owners: ['factory.bridge.near', 'fast.bridge.near'], tokens: ["a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near", 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near'] })
    },
  },
};
