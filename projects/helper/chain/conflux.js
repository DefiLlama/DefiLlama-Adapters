const sdk = require('@defillama/sdk')
const { post } = require('../http')

// Conflux Core space (cfx:... addresses); eSpace 0x addresses go through the evm helpers
const RPC = 'https://main.confluxrpc.com'

// native CFX balance (whole coins) of a core space address
async function getCfxBalance(owner) {
  const { result, error } = await post(RPC, { jsonrpc: '2.0', id: 1, method: 'cfx_getBalance', params: [owner, 'latest_state'] })
  if (error) throw new Error(`conflux: cfx_getBalance failed for ${owner}: ${error.message}`)
  return Number(BigInt(result)) / 1e18
}

async function sumTokens({ balances = {}, owners = [], api }) {
  if (api) balances = api.getBalances()
  for (const owner of owners)
    sdk.util.sumSingleBalance(balances, 'conflux-token', await getCfxBalance(owner))
  return balances
}

module.exports = {
  getCfxBalance,
  sumTokens,
}
