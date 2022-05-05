
const { graphQuery } = require('../helper/http')

const endpoint = 'https://graph.official.finance/graphql'
const query = '{ embrGetProtocolData { totalLiquidity } }'

async function fetch() {
  const response = await graphQuery(endpoint, query)
  return +response.embrGetProtocolData.totalLiquidity
}

module.exports = {
  avalanche: {
    fetch
  },
  fetch
}