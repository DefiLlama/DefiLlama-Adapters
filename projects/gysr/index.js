const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const config = {
  ethereum: { factory: '0xcada3423d33259a94c1ed1a7aeecb73b87d0b684', fromBlock: 11143895, v2PoolFactory: '0xc517a08aee9ca160a610752e50a6ed8087049091', },
  polygon: { v2PoolFactory: '0x3cf6920b8fcbea07700ce4a7c2f009bb785b0742', },
  optimism: { v2PoolFactory: '0x51e03c97570e80824c9c4da7db94fc1b648f11b8', },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, v2PoolFactory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (factory) {
        const logs = await getLogs({ api, target: factory, eventAbi: 'event GeyserCreated (address indexed user, address geyser)', onlyArgs: true, fromBlock, })
        const geysers = logs.map(log => log.geyser)
        const tokens = await api.multiCall({ abi: 'address:token', calls: geysers })
        const bals = await api.multiCall({ abi: 'uint256:totalStaked', calls: geysers, permitFailure: true, })
        api.addTokens(tokens, bals.map(i => i ?? 0))
      }

      if (v2PoolFactory) {
        const pools = await api.fetchList({ lengthAbi: 'uint256:count', itemAbi: 'function list(uint256) view returns (address)', target: v2PoolFactory, })
        const stakingTokens = await api.multiCall({ abi: 'address[]:stakingTokens', calls: pools })
        const bals = await api.multiCall({ abi: 'address[]:stakingTotals', calls: pools, permitFailure: true, })
        stakingTokens.forEach((tokens, i) => {
          api.addTokens(tokens, bals[i] ?? tokens.map(() => 0))
        })
      }
      return sumTokens2({ api, resolveLP: true, })
    }
  }
})