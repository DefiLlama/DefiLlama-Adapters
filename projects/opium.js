const { getConfig } = require('./helper/cache')
const { sumTokens2 } = require('./helper/unwrapLPs')

const config = {
  ethereum: { url: 'https://static.opium.network/data/opium-addresses.json', },
  polygon: { url: 'https://static.opium.network/data/opium-addresses-polygon.json', },
  bsc: { url: 'https://static.opium.network/data/opium-addresses-bsc.json', },
  arbitrum: { url: 'https://static.opium.network/data/opium-addresses-arbitrum.json', },
}

Object.keys(config).forEach(chain => {
  const { url } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { tokens, contracts } = await getConfig('opium/' + api.chain, url)
      return sumTokens2({ api, tokens, owners: contracts })
    }
  }
})
