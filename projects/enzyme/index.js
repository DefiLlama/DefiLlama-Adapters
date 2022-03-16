const axios = require('axios')
const { toUSDTBalances } = require('../helper/balances')


async function tvl() {
  let response = await axios.post('https://app.enzyme.finance/api/graphql' ,{
    'operationName': 'NetworkLatestStats',
    'variables': {
      'currency': 'usd',
      'network': 'ethereum'
    },
    'query': 'query NetworkLatestStats($currency: Currency!, $network: Network!) {\n  networkLatestStats(currency: $currency, network: $network) {\n    gav\n    vaults\n    deposits\n    __typename\n  }\n}'
  })

  return toUSDTBalances(response.data.data.networkLatestStats.gav)
}

module.exports = {
  ethereum: {
    tvl
  }
}