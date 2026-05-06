const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
    arbitrum: {
      tvl: async (api) => {
        await api.sumTokens({
          owners: [
            "0x5a6f8ea5e1028C80CB98Fd8916afBBC4E6b23D80",
            "0xE1d32C985825562edAa906fAC39295370Db72195",
          ],
          tokens: [
            ADDRESSES.arbitrum.WETH, // WETH
            ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
          ],
        });
      },
    },
  };