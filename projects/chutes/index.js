const { post } = require('../helper/http')

// Public Bittensor (subtensor) archive RPC, JSON-RPC over HTTPS.
const RPC = 'https://entrypoint-finney.opentensor.ai'

// Substrate storage key prefixes: twox128("SubtensorModule") ++ twox128(item).
// Both maps are keyed by netuid (u16, Identity hasher), so the full key is
// prefix ++ netuid as little-endian u16. Values are u64 RAO (1 TAO = 1e9 RAO).
const SUBNET_TAO = '0x658faa385070e074c85bf6b568cf05557a57dce016211512d1700561066b85a3'
const SUBNET_ALPHA_IN = '0x658faa385070e074c85bf6b568cf05552ce12f7007574647d692ac7edf8b7a53'

const CHUTES_NETUID = 64
const RPC_TIMEOUT_MS = 30_000

/** Encodes a netuid as little-endian u16 hex for storage key construction. */
const u16le = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]).toString('hex')

/**
 * Sends one JSON-RPC call and returns its result.
 * JSON-RPC errors arrive as HTTP 200 with an error body. Throw instead of
 * falling through: a swallowed error here would report TVL as $0.
 */
async function rpc(method, params) {
  const res = await post(RPC, { jsonrpc: '2.0', id: 1, method, params }, { timeout: RPC_TIMEOUT_MS })
  if (res.error) throw new Error(`${method} RPC error: ${JSON.stringify(res.error)}`)
  return res.result
}

/** Reads a u64 storage value (RAO) at the given block; 0 if the key is unset. */
async function readU64(storageKey, at) {
  const value = await rpc('state_getStorage', [storageKey, at])
  if (value == null) return 0 // key genuinely unset
  const buf = Buffer.from(value.slice(2), 'hex')
  if (buf.length !== 8) throw new Error(`expected u64 (8 bytes) at ${storageKey}, got ${buf.length}`)
  return Number(buf.readBigUInt64LE())
}

/** Only track TAO side of subnet AMM: https://docs.learnbittensor.org/subnets/understanding-subnets#liquidity-pools */
async function tvl(api) {
  const at = await rpc('chain_getFinalizedHead', [])
  const taoIn = await readU64(SUBNET_TAO + u16le(CHUTES_NETUID), at)
  api.addCGToken('bittensor', taoIn / 1e9)
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the TAO reserves of the Chutes (netuid 64) dTAO liquidity pool, read from SubtensorModule.SubnetTAO on public chain RPC.',
  bittensor: { tvl },
}
