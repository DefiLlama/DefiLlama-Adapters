
const { graphQuery } = require('../helper/http')

const endpoint = 'https://graph.embr.finance/graphql'
const query = '{ embrGetProtocolData { totalLiquidity } }'
let _response

async function fetch() {
  if (!_response) _response = graphQuery(endpoint, query)
  const response = await _response
  return +response.embrGetProtocolData.totalLiquidity
}

module.exports = {
  avalanche: {
    fetch
  },
  fetch
}