const { view_account } = require("../helper/chain/near");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
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
      tokens: ["0x0000000000000000000000000000000000000000"],
      logCalls: true,
    }),
  },
  near: {
    tvl: async () => ({
      near: (await view_account("factory.bridge.near")).amount / 1e24,
    }),
  },
};
