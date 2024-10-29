const { getConfig } = require('../helper/cache')
const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')

const API_URL = 'https://bedrock-datacenter.rockx.com/uniBTC/reserve/address'

async function tvl() {
  const response = await getConfig('bedrock.btc_address', API_URL)
  sdk.log(`API load completed: ${response.btc.length} addresses`)
  return sumTokens({ owners: response.btc })
}

module.exports = {
  timetravel: false,
  bitcoin: {
    tvl
  }
}
