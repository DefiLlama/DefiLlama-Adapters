const { post } = require('../http')
const { sleep } = require('../utils')

// Avalanche X-Chain (AVM) native AVAX balances; these addresses are not on the C-Chain so the evm
// path never sees them. Added to the `avax` chain by the caller.
// The public node no longer serves avm.getBalance, so balances are summed from avm.getUTXOs.
const RPC = 'https://api.avax.network/ext/bc/X'
const AVAX_ASSET_ID_HEX = '21e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff' // FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z
const SECP_TRANSFER_OUTPUT = 7
const PAGE_LIMIT = 1024

// utxo hex layout: codecID(2) txID(32) outputIndex(4) assetID(32) typeID(4) amount(8) locktime(8) threshold(4) numAddrs(4) addrs(20 each) checksum(4)
function parseUtxo(hex) {
  const buf = Buffer.from(hex.replace(/^0x/, ''), 'hex')
  const assetID = buf.subarray(38, 70).toString('hex')
  const typeID = buf.readUInt32BE(70)
  const amount = buf.readBigUInt64BE(74)
  return { assetID, typeID, amount }
}

async function getUtxos(addresses) {
  const utxos = []
  let startIndex
  while (true) {
    const params = { addresses, limit: PAGE_LIMIT, encoding: 'hex' }
    if (startIndex) params.startIndex = startIndex
    const { result, error } = await post(RPC, { jsonrpc: '2.0', id: 1, method: 'avm.getUTXOs', params })
    if (error) throw new Error(`avm.getUTXOs: ${error.message}`)
    utxos.push(...result.utxos)
    if (Number(result.numFetched) < PAGE_LIMIT) break
    startIndex = result.endIndex
    await sleep(200)
  }
  return utxos
}

// nAVAX held across the given addresses (one query so shared/multisig utxos are counted once)
async function getBalance(addresses) {
  if (!Array.isArray(addresses)) addresses = [addresses]
  let total = 0n
  for (const hex of await getUtxos(addresses)) {
    const { assetID, typeID, amount } = parseUtxo(hex)
    if (assetID !== AVAX_ASSET_ID_HEX || typeID !== SECP_TRANSFER_OUTPUT) continue
    total += amount
  }
  return total.toString()
}

async function sumTokens({ api, owners = [] }) {
  if (!owners.length) return api.getBalances()
  const balance = await getBalance(owners)
  api.addCGToken('avalanche-2', Number(balance) / 1e9)
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
