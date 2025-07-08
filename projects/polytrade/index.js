const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const LENDER_POOL_CONTRACT = '0xE544a0Ca5F4a01f137AE5448027471D6a9eC9661';
const chain = 'polygon'

module.exports = {
  methodology: 'gets the amount in liquidity pool',
  start: '2022-07-06',
  polygon: {
    tvl: async (_,_b , {polygon: block}) => {
      const strategy = await sdk.api2.abi.call({
        target: LENDER_POOL_CONTRACT,
        abi: abis.strategy,
        chain, block,
      })
      const stable = await sdk.api2.abi.call({
        target: strategy,
        abi: abis.stable,
        chain, block,
      })
      const aStable = await sdk.api2.abi.call({
        target: strategy,
        abi: abis.aStable,
        chain, block,
      })
      return sumTokens2({ chain, block, owner: strategy, tokens: [stable, aStable ]})
    },
  }
}; 

const abis = {
  strategy: "address:strategy",
  stable: "address:stable",
  aStable: "address:aStable",
}