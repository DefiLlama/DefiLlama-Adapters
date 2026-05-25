const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const FEE_MANAGER = "0xfeec000000000000000000000000000000000000"
const TEMPO_TOKENLIST = 'https://tokenlist.tempo.xyz/list/4217'

module.exports = {
  methodology:
    "TVL is the sum of every TIP-20 stablecoin balance held by Tempo's enshrined Stablecoin DEX system contract.",
  start: '2026-03-18',
  tempo: {
    tvl: async (api) => {
      const list = await getConfig('tempo-tokenlist', undefined, {
        fetcher: async (url) => {
          const data = await get(TEMPO_TOKENLIST)
          return data.tokens.map(t => t.address)
        }
      })
      return api.sumTokens({ owner: FEE_MANAGER, tokens: list })
    }
  }
}
