module.exports = {
    arbitrum: {
      tvl: async (api) => {
        await api.sumTokens({
          owners: [
            "0x5a6f8ea5e1028C80CB98Fd8916afBBC4E6b23D80",
            "0xE1d32C985825562edAa906fAC39295370Db72195",
          ],
          tokens: [
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
            "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
          ],
        });
      },
    },
  };