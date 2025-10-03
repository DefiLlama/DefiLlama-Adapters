const { getEnv } = require("../helper/env");
const { post } = require('../helper/http')

const blacklistedTokenSet = new Set([
  '0x5de8ab7e27f6e7a1fff3e5b337584aa43961beef', // project's own governance token
  '0xfdc66a08b0d0dc44c17bbd471b88f49f50cdd20f', // project's own governance token
].map(t => t.toLowerCase()));

const config = {
  ethereum: { graphId: 'ethereum' },
  arbitrum: { graphId: 'arbitrum' },
  bsc: { graphId: 'bsc' },
  base: { graphId: 'base' },
  polygon: { graphId: 'polygon' },
}

Object.keys(config).forEach(chain => {

  async function getData() {
    const { graphId, } = config[chain]
    const subgraphUrl = `https://subgraph.smardex.io/${graphId}/spro`
    const result = await post(subgraphUrl, { query: tokenMetricsQuery, }, {
      headers: {
        origin: "https://subgraph.smardex.io",
        referer: "https://subgraph.smardex.io",
        "x-api-key": getEnv('SMARDEX_SUBGRAPH_API_KEY'),
      },
    })

    return result.data.tokenMetrics_collection;
  }

  module.exports[chain] = {
    tvl:  async (api) => {
      const data = await getData()
      data.forEach((token) => {
        if (blacklistedTokenSet.has(token.id.toLowerCase())) return;
        api.add(token.id, token.totalCollateralAmount);
      })
      api.getBalancesV2().removeNegativeBalances()
    }, 
    borrowed: async (api) => {
      const data = await getData()
      data.forEach((token) => {
        api.add(token.id, token.totalBorrowedAmount);
      })
    },
  }
})


const tokenMetricsQuery = `{
  tokenMetrics_collection {
    id
    totalCollateralAmount
    totalBorrowedAmount
  }
}`;
