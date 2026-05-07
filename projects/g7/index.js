const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
    arbitrum: {
      tvl: async (api) => {
        await api.sumTokens({
          owners: [
            "0x404922a9B29b4a5205a6074AbA31A7392BD28944",
          ],
          tokens: [
            ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
          ],
        });
      },
    },
  };