const { post } = require('../helper/http')

// Public Bittensor (subtensor) archive RPC, JSON-RPC over HTTPS.
const RPC = 'https://entrypoint-finney.opentensor.ai'

// Substrate storage key prefix: twox128("SubtensorModule") ++ twox128("SubnetTAO").
// The map is keyed by netuid (u16, Identity hasher), so each full key is the
// prefix followed by the netuid as little-endian u16, and each value is the
// pool's TAO reserve as a u64 in RAO (1 TAO = 1e9 RAO).
const SUBNET_TAO = '0x658faa385070e074c85bf6b568cf05557a57dce016211512d1700561066b85a3'

// Excluded netuids:
// - 0 (Root) holds the network's root stake, not an AMM pool; counting it
//   would book native staking as DEX liquidity.
// - 64 (Chutes) is tracked by its own adapter (projects/chutes), which counts
//   both pool legs; skipping it here keeps chain totals free of double counts.
const EXCLUDED_NETUIDS = new Set([0, 64])

const PAGE = 500
const RPC_TIMEOUT_MS = 30_000

/**
 * Sends one JSON-RPC call and returns its result. JSON-RPC errors arrive as
 * HTTP 200 with an error body; throw so the run fails loudly instead of
 * producing a bad data point.
 */
async function rpc(method, params) {
  const res = await post(RPC, { jsonrpc: '2.0', id: 1, method, params }, { timeout: RPC_TIMEOUT_MS })
  if (res.error) throw new Error(`${method} RPC error: ${JSON.stringify(res.error)}`)
  return res.result
}

/** Enumerates every SubnetTAO storage key at the given block, one page at a time. */
async function getAllKeys(at) {
  const keys = []
  let startKey = null
  while (true) {
    const page = await rpc('state_getKeysPaged', [SUBNET_TAO, PAGE, startKey, at])
    keys.push(...page)
    if (page.length < PAGE) return keys
    startKey = page[page.length - 1]
  }
}

/**
 * Sums the TAO reserve of every non-excluded subnet pool. Key enumeration and
 * value reads are pinned to one finalized block for an atomic snapshot.
 */
async function tvl(api) {
  const at = await rpc('chain_getFinalizedHead', [])
  const keys = await getAllKeys(at)
  const result = await rpc('state_queryStorageAt', [keys, at])
  const changes = result?.[0]?.changes
  if (!changes) throw new Error(`no SubnetTAO storage returned for ${keys.length} keys`)
  let totalRao = 0n
  for (const [key, value] of changes) {
    if (!value) continue
    const netuid = Buffer.from(key.slice(-4), 'hex').readUInt16LE()
    if (EXCLUDED_NETUIDS.has(netuid)) continue
    totalRao += Buffer.from(value.slice(2), 'hex').readBigUInt64LE()
  }
  // Split BigInt RAO into whole TAO + fractional part so no precision is lost
  // to the float conversion regardless of how large the total grows.
  api.addCGToken('bittensor', Number(totalRao / 1_000_000_000n) + Number(totalRao % 1_000_000_000n) / 1e9)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the TAO reserve of every subnet dTAO liquidity pool (SubtensorModule.SubnetTAO across all netuids), read from public chain RPC at a single finalized block. Root (netuid 0) is excluded because it is network staking rather than an AMM pool. Subnets whose pools are tracked by their own DefiLlama adapter (currently Chutes, netuid 64) are excluded to avoid double counting. Alpha-side reserves are not counted since most alpha tokens have no listed price.',
  bittensor: {
    tvl,
  },
}
