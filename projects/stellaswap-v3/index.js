const { cachedGraphQuery } = require('../helper/cache')
const { toUSDTBalances } = require('../helper/balances')

const SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/stellaswap/pulsar"

async function tvl(_, _b, _cb, { api, }) {
  const { factories } = await cachedGraphQuery('stellaswap-v3/' + api.chain, SUBGRAPH_URL, `{
    factories {
      totalValueLockedUSD
    },
  }`)
  return toUSDTBalances(factories?.[0]?.totalValueLockedUSD)
}

module.exports = {
  moonbeam: {
    tvl: tvl
  }
}
