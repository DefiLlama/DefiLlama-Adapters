const { request, gql } = require('graphql-request');
const { getBlock } = require('../helper/http');
const { sumTokens2 } = require('../helper/unwrapLPs')

const graphs = {
  arbitrum: "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-arbitrum",
  celo: "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-celo"
}

function tvlPaged(chain) {
  return async (_, _b, { [chain]: block }) => {
    block = await getBlock(_, chain, { [chain]: block })
    const balances = {}
    const size = 1000
    let lastId = ''
    let lendgines
    let graphQueryPaged = gql`
    query lendgineQuery($lastId: String, $block: Int) {
      lendgines(block: { number: $block } first:${size} where: {id_gt: $lastId}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `

    do {
      const res = await request(graphs[chain], graphQueryPaged, { lastId, block: block - 5000 });
      lendgines = res.lendgines
      const tokensAndOwners = lendgines.map(i => ([[i.token0.id, i.id], [i.token1.id, i.id]])).flat()
      await sumTokens2({ balances, tokensAndOwners, chain, block, blacklistedTokens: [] })
      lastId = lendgines[lendgines.length - 1].id
    } while (lendgines.length === size)

    return balances
  }
}

module.exports = {
  methodology: `Counts the tokens locked on AMM pools plus the collateral, pulling the data from the 'kyscott/numoen' subgraph`,
  timetravel: false,
}

const chains = ['arbitrum', 'celo']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: tvlPaged(chain)
  }
})
