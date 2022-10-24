
const { graphQuery } = require('../helper/http')

const endpoint = 'https://teste.testeborabora.cyou/graphql'
const query = '{ embrGetProtocolData { totalLiquidity } }'
let _response

async function fetch() {
  if (!_response) _response = graphQuery(endpoint, query)
  const response = await _response
  return +response.embrGetProtocolData.totalLiquidity
}

module.exports = {
  velas:{
    fetch
  },
  fetch
}