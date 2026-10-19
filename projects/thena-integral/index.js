const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const config = {
  bsc: {
    factory: '0x30055F87716d3DFD0E5198C27024481099fB4A98',
    fromBlock: 44121855,
    blacklistedTokens: ['0x39e3ca118ddfea3edc426b306b87f43da3251b4a'],
  },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, blacklistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await getLogs({
        api,
        target: factory,
        fromBlock,
        eventAbi: 'event Pool (address indexed token0, address indexed token1, address pool)',
        onlyArgs: true,
      })
      const customPools = await getLogs({
        api,
        target: factory,
        fromBlock,
        eventAbi: 'event CustomPool (address indexed deployer, address indexed token0, address indexed token1, address pool)',
        onlyArgs: true,
        extraKey: 'custom-pool',
      })
      const ownerTokens = pools.concat(customPools).map(i => [[i.token0, i.token1], i.pool])
      return sumTokens2({ api, ownerTokens, blacklistedTokens, permitFailure: true, })
    }
  }
})
