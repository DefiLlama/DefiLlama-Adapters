const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  sei: { tvl },
}

async function tvl(api) {
  const pools = await getConfig('dragonswap/uni-v3-pools', undefined, {
    fetcher: async () => {
      let { pools } = await get(`https://sei-api.dragonswap.app/api/v1/pools`)
      pools = pools.filter(i => i.type === 'V3_POOL').map(i => i.pool_address)
      return pools
    }
  })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const ownerTokens = pools.map((v, i) => [[token0s[i], token1s[i]], v])
  return sumTokens2({ api, ownerTokens })
}