const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const query = `{
  pools(first: 1000) {
    collaterals{
      pool { id }
      token { id }
    }
  }
}`

async function tvl(api) {
  const { pools } = await cachedGraphQuery('zksynth', 'https://api.thegraph.com/subgraphs/name/prasad-kumkar/zksynth-mainnet', query)
  const tokensAndOwners = pools.map(i => i.collaterals).flat().map(i => [i.token.id, i.pool.id])
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  scroll: {
    tvl
  }
}