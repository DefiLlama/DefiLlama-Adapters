const { call } = require("@defillama/sdk/build/abi/abi2");
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (_, _b, _c, { api, logArray }) =>
      sumTokens2({
        api,
        owner: "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
        fetchCoValentTokens: true,
      }),
  },
  bitcoin: {
    tvl: async (_, _b, chainBlocks, { logArray }) => ({
      bitcoin:
        (await call({
          chain: "avax",
          abi: "erc20:totalSupply",
          target: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
          block: chainBlocks.avax,
        })) /
        10 ** 8,
    }),
  },
};
