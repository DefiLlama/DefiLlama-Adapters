const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const GRAPHQL_URL = 'https://xo-analytics-api-140546530482.europe-west4.run.app/graphql'
const USDC_E = ADDRESSES.xo.USDC

async function fetchAllMarkets() {
  const markets = []
  let after = null
  while (true) {
    const query = `query {
      marketsConnection(
        first: 1000,
        ${after ? `after: "${after}",` : ''}
        where: { block_gt: 0 },
        orderBy: marketAddress_ASC
      ) {
        edges { node { marketAddress } }
        pageInfo { hasNextPage endCursor }
      }
    }`
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const json = await res.json()
    if (json.errors) throw new Error('XO GraphQL error: ' + JSON.stringify(json.errors))
    const conn = json.data.marketsConnection
    markets.push(...conn.edges.map((e) => e.node.marketAddress))
    if (!conn.pageInfo.hasNextPage) break
    after = conn.pageInfo.endCursor
  }
  return markets
}

async function tvl(api) {
  const markets = await fetchAllMarkets()
  return sumTokens2({api, tokensAndOwners: markets.map((m) => [USDC_E, m])}) 
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    'TVL is calculated as the total USDC.e collateral held across all XO Market prediction market contracts on the XO chain.',
  xo: { tvl },
}
