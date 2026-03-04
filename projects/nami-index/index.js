const { request } = require("../helper/utils/graphql")

async function tvl(api) {
  const query = `
    query {
      index {
        status {
            totalValue
        }
      }
    }
  `
  
  const res = await request('https://api.rujira.network/api/graphiql', query)
  const indexData = res.index
  
  // totalValue is a string representing a bigint with 8 decimals in USD
  const totalValue = indexData.reduce((acc, item) => {
    const value = item.status?.totalValue || '0'
    return acc + BigInt(value)
  }, BigInt(0))
  
  const finalValue = Number(totalValue) / 1e8
  
  api.addUSDValue(finalValue)
}

module.exports = {
  methodology: "TVL is calculated by retrieving the USD value of each index and aggregating the results using the official Rujira Network GraphQL API.",
  timetravel: false,
  misrepresentedTokens: true,
  thorchain: {
    tvl
  }
}