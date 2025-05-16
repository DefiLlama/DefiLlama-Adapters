
const sdk = require('@defillama/sdk');

const tokenAddress = "0x7f69a2ba074dA1Fd422D994ee05C4B8CA83A32C7"; 

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
