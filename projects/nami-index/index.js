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
  
  try {
    const res = await request('https://api.rujira.network/api/graphiql', query)
    const indexData = res.index
    console.log('Index Data:', indexData)
    
    if (!Array.isArray(indexData)) {
      throw new Error('Expected index to be an array')
    }
    
    // totalValue is a string representing a bigint with 8 decimals in USD
    const totalValue = indexData.reduce((acc, item) => {
      const value = item.status?.totalValue || '0'
      return acc + BigInt(value)
    }, BigInt(0))
    
    const finalValue = Number(totalValue) / 1e8
    
    api.addUSDValue(finalValue)
  } catch (error) {
    console.error('Error fetching GraphQL data:', error)
    throw error
  }
}

module.exports = {
  methodology: "TVL is calculated by retrieving the USD value of each index and aggregating the results using the official Rujira Network GraphQL API.",
  start: '2025-07-24',
  timetravel: false,
  thorchain: {
    tvl
  }
}