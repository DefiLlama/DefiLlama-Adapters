const sdk = require('@defillama/sdk');

const tokenAddress = "0x80C080acd48ED66a35Ae8A24BC1198672215A9bD"; 

module.exports = {
  hsk: {
    tvl: async (api) => {
      const totalSupplyRes = await sdk.api.erc20.totalSupply({
        target: tokenAddress,
        chain: 'hsk',
        block: api.block,
      });

      const supply = totalSupplyRes.output;

      return {
        [`hsk:${tokenAddress}`]: supply,
      };
    }
  }
};
