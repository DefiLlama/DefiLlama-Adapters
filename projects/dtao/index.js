const { rpc, getFinalizedHead, subtensorPrefix, keyHex, hexToBuf, u64LE } = require('../helper/chain/bittensor')

const SUBNET_TAO = '0x658faa385070e074c85bf6b568cf05557a57dce016211512d1700561066b85a3'

// Excluded netuids:
// - 0 (Root) holds the network's root stake, not an AMM pool; counting it
//   would book native staking as DEX liquidity.
// - 64 (Chutes) is tracked by its own adapter (projects/chutes), which counts
//   both pool legs; skipping it here keeps chain totals free of double counts.
const EXCLUDED_NETUIDS = new Set([0, 64])

const PAGE = 500

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
  const at = await getFinalizedHead()
  const keys = await getAllKeys(at)
  const result = await rpc('state_queryStorageAt', [keys, at])
  const changes = result?.[0]?.changes
  if (!changes) throw new Error(`no SubnetTAO storage returned for ${keys.length} keys`)
  let totalRao = 0n
  for (const [key, value] of changes) {
    if (!value) continue
    const netuid = hexToBuf(key.slice(-4)).readUInt16LE()
    if (EXCLUDED_NETUIDS.has(netuid)) continue
    totalRao += u64LE(hexToBuf(value))
  }
  api.addCGToken('bittensor', Number(totalRao) / 1e9)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the TAO reserve of every subnet dTAO liquidity pool (SubtensorModule.SubnetTAO across all netuids), read from public chain RPC at a single finalized block. Root (netuid 0) is excluded because it is network staking rather than an AMM pool. Subnets whose pools are tracked by their own DefiLlama adapter (currently Chutes, netuid 64) are excluded to avoid double counting. Alpha-side reserves are not counted since most alpha tokens have no listed price.',
  bittensor: {
    tvl,
  },
}
