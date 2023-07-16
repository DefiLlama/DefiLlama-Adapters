const { request, gql } = require('graphql-request');
const { getBlock } = require('../helper/http');
const { sumTokens2 } = require('../helper/unwrapLPs')

const graphs = {
  era: "https://api.studio.thegraph.com/query/49147/derpdex-v3-amm/v0.0.6"
}

const blacklists = {}

function v3TvlPaged(chain) {
  return async (_, _b, { [chain]: block }) => {
    block = await getBlock(_, chain, { [chain]: block })
    const balances = {}
    const size = 1000
    let lastId = ''
    let pools
    let graphQueryPaged = gql`
    query poolQuery($lastId: String, $block: Int) {
      pools(block: { number: $block } first:${size} where: {id_gt: $lastId}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `
  
  // remove the bad pools
    const blacklisted = blacklists[chain] || []

    do {
      const res = await request(graphs[chain], graphQueryPaged, { lastId, block: block - 5000 });
      pools = res.pools
      const tokensAndOwners = pools.map(i => ([[i.token0.id, i.id], [i.token1.id, i.id]])).flat()
      await sumTokens2({ balances, tokensAndOwners, chain, block, blacklistedTokens: blacklisted })
      lastId = pools[pools.length - 1]?.id
    } while (pools.length === size)

    return balances
  }
}

const chain = 'era'

module.exports[chain] = {
  tvl: v3TvlPaged(chain)
}