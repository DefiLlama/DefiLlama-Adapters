const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { factory: '0xfc462354dc9cac684516b49f002ae769514bbe63', fromBlock: 197467973, PSM: '0xc273c03D7F28f570C6765Be50322BC06bdd4bFab', }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, PSM } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const toa = []
      if (PSM) {
        const token = await api.call({ abi: 'address:pegToken', target: PSM })
        toa.push([token, PSM])
      }

      const logs = await getLogs2({
        skipCacheRead: true,
        api,
        factory,
        eventAbi: 'event TermCreated(uint256 indexed when, uint256 indexed gaugeType, address indexed term, bytes params)',
        fromBlock,
      })

      const terms = logs.map(log => log.term)
      const tokens = await api.multiCall({ abi: 'address:collateralToken', calls: terms })
      tokens.forEach((token, i) => toa.push([token, terms[i]]))
      await api.sumTokens({ tokensAndOwners: toa })
    }
  }
})