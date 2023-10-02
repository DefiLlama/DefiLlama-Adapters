const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  shimmer_evm: { endpoint: 'https://shimmer.subgraph.tangleswap.space/subgraphs/name/tangleswap/shimmer' },
}
const query = `query getPools($lastId: String!) {
  pools(
    first: 1000
    where: {id_gt: $lastId}
  ) {
    id
    token0 {      id    }
    token1 {      id    }
  }
}`

async function tvl(ts, block, _, { api }) {
  const { endpoint } = config[api.chain]
  const pools = await cachedGraphQuery('tangleswap/' + api.chain, endpoint, query, { fetchById: true, })
  return sumTokens2({
    api,
    ownerTokens: pools.map(i => {
      return [[i.token0.id, i.token1.id], i.id]
    })
  })
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})