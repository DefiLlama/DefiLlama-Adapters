const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
    arbitrum: {
      tvl: async (api) => {
        await api.sumTokens({
          owners: [
            "0x404922a9B29b4a5205a6074AbA31A7392BD28944",
          ],
          tokens: [
            "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
          ],
        });
      },
    },
  };