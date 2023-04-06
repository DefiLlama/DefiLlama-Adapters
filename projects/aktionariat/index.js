const { request, gql } = require('graphql-request');
const { getBlock } = require('../helper/http');
const { sumTokens2 } = require('../helper/unwrapLPs')

const graphs = {
  ethereum: "https://api.thegraph.com/subgraphs/name/aktionariat/brokerbot",
  optimism: "https://api.thegraph.com/subgraphs/name/aktionariat/brokerbot-optimism",
}

function tvlPaged(chain) {
  return async (_, _b, { [chain]: block }) => {
    block = await getBlock(_, chain, { [chain]: block })
    const balances = {}
    const size = 1000
    let lastId = ''
    let brokerbots
    let graphQueryPaged = gql`
    query brokerbotQuery($lastId: String, $block: Int) {
      brokerbots(block: { number: $block } first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        token { id }
        base { id }
      }
    }
  `
  

    do {
      const res = await request(graphs[chain], graphQueryPaged, { lastId, block: block - 5000 });
      brokerbots = res.brokerbots
      const tokensAndOwners = brokerbots.map(i => ([[i.token.id, i.id], [i.base.id, i.id]])).flat()
      await sumTokens2({ balances, tokensAndOwners, chain, block })
      lastId = brokerbots[brokerbots.length - 1]?.id
    } while (brokerbots.length === size)

    return balances
  }
}

module.exports = {
  methodology: `Counts the tokens locked on brokerbots, pulling the brokerbot addresses from the 'aktionariat/brokerbot' subgraph`,
  timetravel: false,
  hallmarks: []
}
const chains = ['ethereum', 'optimism']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: tvlPaged(chain)
  }
})
