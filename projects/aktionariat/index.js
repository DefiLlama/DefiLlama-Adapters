const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')

const graphs = {
  ethereum: sdk.graph.modifyEndpoint('2ZoJCp4S7YP7gbYN2ndsYNjPeZBV1PMti7BBoPRRscNq'),
  optimism: sdk.graph.modifyEndpoint('3QfEXbPfP23o3AUzcmjTfRtUUd4bfrFj3cJ4jET57CTX'),
}

function tvlPaged(chain) {
  return async (api) => {
    const size = 1000
    let graphQueryPaged = `
    query brokerbotQuery($lastId: String, $block: Int) {
      brokerbots(block: { number: $block } first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        token { id }
        base { id }
      }
    }
  `
    const data = await cachedGraphQuery('aktionariat-brokerbot/' + chain, graphs[chain], graphQueryPaged, { useBlock: true, api, fetchById: true, })
    const ownerTokens = data.map(i => [[i.token.id, i.base.id], i.id])
    return api.sumTokens({ ownerTokens })
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
