const ADDRESSES = require('../helper/coreAssets.json')
const { view_account, getTokenBalance } = require("../helper/chain/near");
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
  aurora: {
    tvl: sumTokensExport({
      owner: "0xb0bD02F6a392aF548bDf1CfAeE5dFa0EefcC8EaB",
      tokens: [ADDRESSES.null],
      logCalls: true,
    }),
  },
  near: {
    tvl: async () => ({
      near:
        (Number((await view_account("factory.bridge.near")).amount) +
          Number((await view_account("fast.bridge.near")).amount)) /
        1e24,
      ethereum: (await getTokenBalance("aurora", "fast.bridge.near")) / 1e18,
      "usd-coin":
        (await getTokenBalance(
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
          "fast.bridge.near"
        )) / 1e6,
    }),
  },
};
