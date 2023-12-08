const abis = require('../helper/abis/siren.json');
const sdk = require('@defillama/sdk');

const config = {
  arbitrum: {hedgePools: ["0x07835De4f96164758fE68283a5466E066c1885DC"]},
}
Object.keys(config).forEach(chain => {
  const hedgePools = config[chain].hedgePools;
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      let balances = {}
      for (const hedgePool of hedgePools) {
        const pricePerShare = (
          await sdk.api.abi.call({
            target: hedgePool,
            abi: abis.pricePerShareCached,
            chain: 'arbitrum'
          })
        ).output;
        const totalSupply = (
          await sdk.api.abi.call({
            target: hedgePool,
            abi: abis.totalSupply,
            chain: 'arbitrum'
          })
        ).output;
        const tvl = (totalSupply / 1e6) * (pricePerShare / 1e2);
        // console.log(totalTVL)
        const collateralToken = (
          await sdk.api.abi.call({
            abi: abis.collateralToken,
            target: hedgePool,
            chain: 'arbitrum'
          })
        ).output;
        // Calculate TVL for collateralToken here
        balances[`arbitrum:${collateralToken}`] = parseInt(tvl);
      }
      return balances;
    }
  }
});