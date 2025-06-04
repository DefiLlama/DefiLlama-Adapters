const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
        fetchCoValentTokens: true,
      }),
  },
  bitcoin: {
    tvl: async (_, _b, chainBlocks) => ({
      bitcoin:
        (await sdk.api2.abi.call({
          chain: "avax",
          abi: "erc20:totalSupply",
          target: ADDRESSES.avax.BTC_b,
          block: chainBlocks.avax,
        })) /
        10 ** 8,
    }),
  },
};
