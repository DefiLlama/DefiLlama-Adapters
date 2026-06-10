const { post } = require('../helper/http')

const RPC = 'https://entrypoint-finney.opentensor.ai'

// Storage key for System.Account(BRIDGE_ADDRESS) on Bittensor finney.
//   (twox128("System") + twox128("Account")) + blake2_128(pubkey) + pubkey
// BRIDGE_ADDRESS: 5GtfvaMYH6hp78rG8mi7wJFxxQ9JwL23Qj9SUWDPYvT8uymL
const BRIDGE_ACCOUNT_STORAGE_KEY =
  '0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9' + // System.Account prefix
  '71653f154c2d8425e7a780d53f54832fd58635178241ff6a7b7b429afaeb8089' + // blake2_128(pubkey)
  'bea1dce0384a2912564f758a9ab020a8' // pubkey (32 bytes)

// AccountInfo layout: 4 u32 (nonce, consumers, providers, sufficients), u128 LE (AccountData.free)
const FREE_OFFSET = 16
const RPC_TIMEOUT_MS = 30_000

async function rpc(method, params) {
  const res = await post(RPC, { jsonrpc: '2.0', id: 1, method, params }, { timeout: RPC_TIMEOUT_MS })
  if (res.error) throw new Error(`${method} RPC error: ${JSON.stringify(res.error)}`)
  return res.result
}

const tvl = async (api) => {
  const at = await rpc('chain_getFinalizedHead', [])
  const value = await rpc('state_getStorage', [BRIDGE_ACCOUNT_STORAGE_KEY, at])
  if (!value) throw new Error('tensorplex: bridge account storage missing')

  const buf = Buffer.from(value.slice(2), 'hex')
  const lo = buf.readBigUInt64LE(FREE_OFFSET)
  const hi = buf.readBigUInt64LE(FREE_OFFSET + 8)
  const free = lo + (hi << 64n)

  api.addCGToken('bittensor', Number(free) / 1e9)
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL counts all TAO in the bittensor reserve address: 5GtfvaMYH6hp78rG8mi7wJFxxQ9JwL23Qj9SUWDPYvT8uymL.',
  bittensor: { tvl },
}
