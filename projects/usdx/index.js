const sdk = require("@defillama/sdk");
const usdxAddress = "0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef";
const chains = ["ethereum", "bsc", "arbitrum"];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api, block) => {
      const res = await sdk.api.erc20.totalSupply({
        target: usdxAddress,
        block,
        chain: chain,
        decimals: 18,
      });
      return {
        "usd-coin": res.output,
      };
    },
  };
});
