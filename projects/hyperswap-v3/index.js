const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

module.exports = {
  hyperliquid: {
    tvl
  },
}

async function tvl(api) {
  const ownerTokens = await getConfig('hyperswap-v3/' + api.chain, undefined, {
    fetcher: async () => {
      let page = 0
      const ownerTokens = []
      let hasMore = false
      do {
        const { data: { pairs, pageCount } } = await get(`https://api.hyperswap.exchange/api/pairs?page=${page}&maxPerPage=50`)
        page++
        hasMore = page < pageCount
        pairs.forEach(p => {
          const pair = p.pairAddress
          const token0 = p.token0.token0Address
          const token1 = p.token1.token1Address
          if (!pair || !token0 || !token1) throw new Error('Invalid pair data')
          ownerTokens.push([[token0, token1], pair])
        })
      } while (hasMore)
      return ownerTokens
    }
  })
  return api.sumTokens({ ownerTokens })
}