const axios = require('axios')
const { toUSDTBalances } = require('../helper/balances')


async function tvl() {
  let networkAssetBalances = (await axios.post('https://app.enzyme.finance/api/graphql' ,{
    "operationName": "NetworkAssetBalances",
    "variables": {
      "currency": "usd",
      "network": "ethereum"
    },
    "query": "query NetworkAssetBalances($currency: Currency!, $network: Deployment!) {\n  networkAssetBalances(currency: $currency, network: $network) {\n    assetAddress\n    numberOfVaults\n    balance\n    balanceChange24h\n    price\n    priceChange24h\n    value\n    __typename\n  }\n}"
  })).data.data.networkAssetBalances

  const sumTVL = networkAssetBalances.reduce((agg, {balance, price }) => {
    return agg + balance * price
  }, 0)

  return toUSDTBalances(sumTVL)
}

module.exports = {
  ethereum: {
    tvl
  }
}