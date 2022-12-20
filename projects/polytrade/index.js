const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const LENDER_POOL_CONTRACT = '0xE544a0Ca5F4a01f137AE5448027471D6a9eC9661';
const chain = 'polygon'

module.exports = {
  methodology: 'gets the amount in liquidity pool',
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
  strategy: {"inputs":[],"name":"strategy","outputs":[{"internalType":"contract IStrategy","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  stable: {"inputs":[],"name":"stable","outputs":[{"internalType":"contract IStrategy","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  aStable: {"inputs":[],"name":"aStable","outputs":[{"internalType":"contract IStrategy","name":"","type":"address"}],"stateMutability":"view","type":"function"},
}