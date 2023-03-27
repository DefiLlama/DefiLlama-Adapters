
const { onChainTvl } = require('../helper/balancer')

const { graphQuery } = require('../helper/http')

const endpoint = 'https://teste.testeborabora.cyou/graphql'
const query = '{ embrGetProtocolData { totalLiquidity } }'
let _response

async function fetch() {
  if (!_response) _response = graphQuery(endpoint, query)
  const response = await _response
  return { tether: +response.embrGetProtocolData.totalLiquidity }
}

module.exports = {
  misrepresentedTokens: true,
  velas:{
    // tvl: onChainTvl('0xa4a48dfcae6490afe9c779bf0f324b48683e488c', 56062385)
    tvl: fetch,
  },
}