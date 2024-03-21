const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

const query = `{
  pools {
    id
    token0 { id }
    token1 { id }
  }
}`

async function tvl(api) {
  const { pools } = await cachedGraphQuery('elektrik/test-2', 'https://subgraph.elektrik.network/subgraphs/name/ELEKTRIK-GRAPH', query)
  const ownerTokens = pools.map(i => [[i.token0.id, i.token1.id], i.id])
  return sumTokens2({ api, ownerTokens, })
}


module.exports = {
  lightlink_phoenix: { tvl }
}
