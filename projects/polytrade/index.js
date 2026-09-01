const { sumTokens2 } = require('../helper/unwrapLPs')
const LENDER_POOL_CONTRACT = '0xE544a0Ca5F4a01f137AE5448027471D6a9eC9661'

module.exports = {
  methodology: 'gets the amount in liquidity pool',
  start: '2022-07-06',
  polygon: {
    tvl: async (api) => {
      const strategy = await api.call({
        target: LENDER_POOL_CONTRACT,
        abi: abis.strategy,
      })
      const stable = await api.call({
        target: strategy,
        abi: abis.stable,
      })
      const aStable = await api.call({
        target: strategy,
        abi: abis.aStable,
      })
      return sumTokens2({ api, owner: strategy, tokens: [stable, aStable] })
    },
  }
};

const abis = {
  strategy: "address:strategy",
  stable: "address:stable",
  aStable: "address:aStable",
}