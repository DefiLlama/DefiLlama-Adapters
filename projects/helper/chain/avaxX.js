const { post } = require('../http')
const { sleep } = require('../utils')

// Avalanche X-Chain (AVM) native AVAX balances; these addresses are not on the C-Chain so the evm
// path never sees them. Added to the `avax` chain by the caller.
const RPC = 'https://api.avax.network/ext/bc/X'
const AVAX_ASSET_ID = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'

async function getBalance(address) {
  const { result } = await post(RPC, { jsonrpc: '2.0', id: 1, method: 'avm.getBalance', params: { address, assetID: AVAX_ASSET_ID } })
  return result.balance // nAVAX
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('avalanche-2', Number(balance) / 1e9)
    await sleep(200)
  }
  return api.getBalances()
}

function sumTokensExport(options) {
  return (api) => sumTokens({ ...options, api })
}

module.exports = {
  getBalance,
  sumTokens,
  sumTokensExport,
}
