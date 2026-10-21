const axios = require('axios')
const { DEFAULT_TIMEOUT } = require('../http')

// Flux (ex ZelCash) is a Zcash fork with its own chain; t1... transparent addresses
const EXPLORER_API = 'https://explorer.runonflux.io/api'

// confirmed FLUX balance in satoshis (8 decimals)
async function getBalance(addr) {
  const { data } = await axios.get(`${EXPLORER_API}/addr/${addr}/balance`, { timeout: DEFAULT_TIMEOUT })
  return Number(data)
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners)
    api.addCGToken('zelcash', await getBalance(owner) / 1e8)
  return api.getBalances()
}

module.exports = {
  getBalance,
  sumTokens,
}
