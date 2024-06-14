const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const query = `query FundsTVL{ funds { id  } }`

module.exports = {
  start: 1713312000, //  Apr 17 2024 00:00:00 GMT+0000
}

const config = {
  arbitrum: { endpoint: sdk.graph.modifyEndpoint('DHZvo3KRhryqHH9zj9sK8n9sjXvg3ddmDoVdLZcZQMJg'), },
}

Object.keys(config).forEach(chain => {
  const { endpoint } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { funds } = await cachedGraphQuery('swaap-earn/' + chain, endpoint, query)
      return api.erc4626Sum({ calls: funds.map(i => i.id), isOG4626: true, })
    }
  }
})