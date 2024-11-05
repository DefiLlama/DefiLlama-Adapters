const { getConfig } = require('../cache')

module.exports = {
  bedrock: async () => {
    const API_URL = 'https://bedrock-datacenter.rockx.com/uniBTC/reserve/address'
    const { btc } = await getConfig('bedrock.btc_address', API_URL)
    return btc
  }
}