const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  aura: { tvl },
}

async function tvl(api) {
  const pools = await getConfig('halo-trade/uni-v3-pools', undefined, {
    fetcher: async () => {
      let page = 0
      let size = 100
      let hasMore = true
      const pools = []
      do {
        const { data: { res: { results } } } = await get(`https://api.halotrade.zone/api/v1/evm/univ3/halo-pool/poolList?page=${page}&pageSize=${size}`)
        page++
        hasMore = results.length === size
        pools.push(...results.map(i => i.poolContractAddr))
      } while (hasMore)
      return pools
    }
  })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const ownerTokens = pools.map((v, i) => [[token0s[i], token1s[i]], v])
  return sumTokens2({ api, ownerTokens })
}