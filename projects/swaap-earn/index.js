const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const query = `query FundsTVL{ funds { id  } }`

module.exports = {
  start: '2024-04-17', //  Apr 17 2024 00:00:00 GMT+0000
}

const config = {
  arbitrum: { endpoint: 'https://api.goldsky.com/api/public/project_clws2t7g7ae9c01xsbnu80a51/subgraphs/swaap-earn-arbitrum/1.0.0/gn', },
  ethereum: { endpoint: 'https://api.goldsky.com/api/public/project_clws2t7g7ae9c01xsbnu80a51/subgraphs/swaap-earn-ethereum/1.0.0/gn', },
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