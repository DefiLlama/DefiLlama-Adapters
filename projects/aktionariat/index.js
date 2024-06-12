const { cachedGraphQuery } = require('../helper/cache')

const graphs = {
  ethereum: "https://api.thegraph.com/subgraphs/name/aktionariat/brokerbot",
  optimism: "https://api.thegraph.com/subgraphs/name/aktionariat/brokerbot-optimism",
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
