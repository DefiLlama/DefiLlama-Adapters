const sdk = require("@defillama/sdk");
const { post } = require('../helper/http')

const GRAPHQL_ENDPOINT = 'https://graphql.mainnet.stargaze-apis.com/graphql'

async function tvl() {
  const balances = {};

  const { data } = await post(GRAPHQL_ENDPOINT, {
    query: '{ analytics { platformTotals { usdValueLockedInBids } } }'
  })

  const usdLocked = data.analytics.platformTotals.usdValueLockedInBids
  sdk.util.sumSingleBalance(balances, 'tether', usdLocked)

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: 'Queries the Stargaze GraphQL API for the USD value locked in marketplace bids.',
  stargaze: { tvl }
};
