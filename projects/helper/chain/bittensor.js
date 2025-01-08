const sdk = require('@defillama/sdk')
const { post } = require('../http')

const TAO_STATS_SUBQUERY = "https://api.subquery.network/sq/TaoStats/bittensor-indexer";

async function getBalance(key) {
  const query = `{
        query{
            account(id: "${key}"){
                id
                nodeId
                balanceTotal
                balanceStaked
                balanceFree
                address
            }
        }
    }`;


  const { data: { query: { account: { balanceTotal } } } } = await post(TAO_STATS_SUBQUERY, { query, variables: {}, });
  return balanceTotal/1e9
}


async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners) {
    const balance = await getBalance(owner)
    total += balance
  }
  sdk.util.sumSingleBalance(balances, 'bittensor', total)
  return balances
}

module.exports = {
  sumTokens
}