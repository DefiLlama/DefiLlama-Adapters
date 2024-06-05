const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { factory: '0xfc462354dc9cac684516b49f002ae769514bbe63', fromBlock: 197467973, PSMs: ['0xc273c03D7F28f570C6765Be50322BC06bdd4bFab', '0x475840078280BaE8EF2428dbe151c7b349CF3f50'], }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, PSMs = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:pegToken', calls: PSMs })
      const owners = [...PSMs]

      const logs = await getLogs2({
        skipCacheRead: true,
        api,
        factory,
        eventAbi: 'event TermCreated(uint256 indexed when, uint256 indexed gaugeType, address indexed term, bytes params)',
        fromBlock,
      })

      const terms = logs.map(log => log.term)
      const tokens1 = await api.multiCall({ abi: 'address:collateralToken', calls: terms })
      tokens.push(...tokens1)
      owners.push(...terms)
      await api.sumTokens({ tokensAndOwners2: [tokens, owners] })
    }
  }
})