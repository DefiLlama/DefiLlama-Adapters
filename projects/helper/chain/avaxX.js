const { get } = require('../http')
const { sleep, sliceIntoChunks } = require('../utils')

// Avalanche X-Chain (AVM) native AVAX balances; these addresses are not on the C-Chain so the evm
// path never sees them. Added to the `avax` chain by the caller.
// Public nodes no longer serve avm.getBalance, so balances come from Ava Labs' Glacier data api
const API = 'https://glacier-api.avax.network/v1/networks/mainnet/blockchains/x-chain/balances'
const AVAX_ASSET_ID = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'

const stripPrefix = (address) => address.replace(/^X-/, '')

// summed nAVAX across the given addresses: unlocked, locked and atomic memory (exported, not yet imported)
async function getBalance(addresses) {
  if (!Array.isArray(addresses)) addresses = [addresses]
  const { balances } = await get(`${API}?addresses=${addresses.map(stripPrefix).join(',')}`)
  let total = 0n
  for (const list of Object.values(balances))
    for (const { assetId, amount } of list)
      if (assetId === AVAX_ASSET_ID) total += BigInt(amount)
  return total.toString()
}

async function sumTokens({ api, owners = [] }) {
  for (const chunk of sliceIntoChunks(owners, 50)) {
    const balance = await getBalance(chunk)
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
