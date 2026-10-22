const axios = require('axios')
const { DEFAULT_TIMEOUT } = require('../http')

// Theta mainnet keeps native THETA in the account ledger next to TFUEL; the EVM rpc
// (eth_getBalance) only exposes TFUEL, so THETA has to be read from the explorer api
const EXPLORER_API = 'https://explorer-api.thetatoken.org/api'

// liquid native THETA (whole coins) held by an address; the explorer 404s for addresses
// that never had a ledger account, which means a zero balance
async function getThetaBalance(owner) {
  const { status, data } = await axios.get(`${EXPLORER_API}/account/${owner.toLowerCase()}`, { validateStatus: s => s === 200 || s === 404, timeout: DEFAULT_TIMEOUT })
  if (status === 404) return 0
  return Number(data?.body?.balance?.thetawei ?? 0) / 1e18
}

async function addThetaBalances(api, owners) {
  for (const owner of owners)
    api.addCGToken('theta-token', await getThetaBalance(owner))
  return api.getBalances()
}

module.exports = {
  getThetaBalance,
  addThetaBalances,
}
