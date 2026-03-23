const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
    base: {
      tvl: async (api) => {
        await api.sumTokens({
          owners: ["0x0a7EFC7161fAa3DFA597481C62bb7B232AAB2Fa0"],
          tokens: [ADDRESSES.base.USDC],
        });
      },
    },
  };
