const cloudscraper = require('cloudscraper')

async function fetch() {
  const uri = 'https://info.hydradex.org/graphql'
  const body = { "operationName": "Query", "variables": {}, "query": "query Query {\n  hydraswapFactories(where: {id: \"5a2a927bea6c5f4a48d4e0116049c1e36d52a528\"}) {\n    totalLiquidityUSD\n  }\n}\n" }
  const reserves = (
    await cloudscraper.post(uri, {
      json: body
    })
  )
  return { tether: +reserves.data.hydraswapFactories[0].totalLiquidityUSD }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: "We count liquidity on the dex, pulling data from subgraph",
  hydra: {
    tvl: fetch,
  },
};