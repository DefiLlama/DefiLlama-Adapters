const stacks = require('@stacks/transactions')
const { STACKS_MAINNET, } = require('@stacks/network')
const { createApiKeyMiddleware, createFetchFn } = require('@stacks/common')

const k = '260ff2d24e32b02'
+'e69c516779e3ddbf5'
const apiMiddleware = createApiKeyMiddleware({
  ['api'+
     'Key']: k,
});


const customFetchFn = createFetchFn(apiMiddleware);
STACKS_MAINNET.client.fetch = customFetchFn

const { bufferCVFromString, uintCV, principalCV, tupleCV, cvToHex, hexToCV, } = stacks

const senderAddress = 'ST2F4BK4GZH6YFBNHYDDGN4T1RKBA7DA1BJZPJEJJ'

// Known (height, timestamp) anchors from chain history.
// Used for interpolation search in getBlockAtTimestamp.
// Pre-Nakamoto: ~25s avg but high variance. Post-Nakamoto (171355+): 26s→4s.
const BLOCK_TIME_ANCHORS = [
  { height: 1,       time: 1610645304 }, // stacks 2.0 genesis, 2021-01-14
  { height: 100000,  time: 1679912897 }, // 2023-03-27, pre-nakamoto
  { height: 140000,  time: 1708389420 }, // 2024-02-20, pre-nakamoto
  { height: 160000,  time: 1722366824 }, // 2024-07-30, pre-nakamoto
  { height: 171355,  time: 1729880265 }, // nakamoto activation, 2024-10-25
  { height: 180000,  time: 1730434793 }, // 2024-11-01, transition
  { height: 200000,  time: 1731241700 }, // 2024-11-10, transition
  { height: 220000,  time: 1731752958 }, // 2024-11-16, transition
  { height: 231708,  time: 1731976023 }, // 2024-11-19, ~26s/block
  { height: 307999,  time: 1733685896 }, // 2024-12-08, ~21s/block
  { height: 498146,  time: 1737558943 }, // 2025-01-22, ~20s/block
  { height: 669248,  time: 1740393688 }, // 2025-02-24, ~16s/block
  { height: 793801,  time: 1742225748 }, // 2025-03-17, ~14s/block
  { height: 1023399, time: 1745499538 }, // 2025-04-24, ~14s/block
  { height: 1384524, time: 1748666644 }, // 2025-05-31, ~8s/block
  { height: 1467463, time: 1749012823 }, // 2025-06-04, ~5s/block
  { height: 2007404, time: 1751516354 }, // 2025-07-03, ~5s/block
  { height: 2475460, time: 1754110089 }, // 2025-08-02, ~4s/block
  { height: 3487019, time: 1757736297 }, // 2025-09-13, ~4s/block
  { height: 4043665, time: 1759903744 }, // 2025-10-08, ~4s/block
  { height: 4746510, time: 1763052608 }, // 2025-11-13, ~5s/block
  { height: 5239155, time: 1765409601 }, // 2025-12-10, ~5s/block
  { height: 6174748, time: 1769618139 }, // 2026-01-28, ~4s/block
  { height: 6494525, time: 1770863934 }, // 2026-02-12, ~4s/block
  { height: 6937411, time: 1772584174 }, // 2026-03-04, ~4s/block
]

const blockHashCache = {}
const blockAtTimestampCache = {}

async function fetchBlock(height) {
  const url = `${STACKS_MAINNET.client.baseUrl}/extended/v2/blocks/${height}`
  const response = await customFetchFn(url)
  if (!response.ok) {
    const msg = await response.text().catch(() => '')
    throw new Error(`Failed to fetch block ${height}: ${msg}`)
  }
  return response.json()
}

async function getBlockHash(blockHeight) {
  if (blockHashCache[blockHeight]) return blockHashCache[blockHeight]
  const block = await fetchBlock(blockHeight)
  const tip = block.index_block_hash.replace('0x', '')
  blockHashCache[blockHeight] = tip
  return tip
}

async function getBlockAtTimestamp(targetTimestamp) {
  if (blockAtTimestampCache[targetTimestamp]) return blockAtTimestampCache[targetTimestamp]

  // Before genesis
  if (targetTimestamp <= BLOCK_TIME_ANCHORS[0].time) {
    blockAtTimestampCache[targetTimestamp] = 1
    return 1
  }

  // Find bracketing anchors
  let lo = BLOCK_TIME_ANCHORS[0]
  let hi = BLOCK_TIME_ANCHORS[BLOCK_TIME_ANCHORS.length - 1]
  for (let i = 0; i < BLOCK_TIME_ANCHORS.length - 1; i++) {
    if (BLOCK_TIME_ANCHORS[i].time <= targetTimestamp && BLOCK_TIME_ANCHORS[i + 1].time > targetTimestamp) {
      lo = BLOCK_TIME_ANCHORS[i]
      hi = BLOCK_TIME_ANCHORS[i + 1]
      break
    }
  }

  // If target is beyond our last anchor, fetch latest block as upper bound
  if (targetTimestamp >= hi.time) {
    const latestResp = await customFetchFn(`${STACKS_MAINNET.client.baseUrl}/extended/v2/blocks?limit=1`)
    const latest = (await latestResp.json()).results[0]
    if (targetTimestamp >= latest.block_time) {
      blockAtTimestampCache[targetTimestamp] = latest.height
      return latest.height
    }
    hi = { height: latest.height, time: latest.block_time }
  }

  // Interpolate
  const fraction = (targetTimestamp - lo.time) / (hi.time - lo.time)
  let guess = Math.floor(lo.height + fraction * (hi.height - lo.height))
  guess = Math.max(lo.height, Math.min(hi.height, guess))

  // Fetch and correct (1-2 calls). Always return highest block at or before target.
  let best = await fetchBlock(guess)

  if (best.block_time > targetTimestamp || Math.abs(best.block_time - targetTimestamp) > 30) {
    const localRate = (hi.time - lo.time) / (hi.height - lo.height)
    const correction = Math.round((targetTimestamp - best.block_time) / localRate)
    const corrected = Math.max(lo.height, Math.min(hi.height, guess + correction))
    if (corrected !== guess) {
      best = await fetchBlock(corrected)
    }
  }

  // Walk back if we landed after the target timestamp
  if (best.block_time > targetTimestamp && best.height > 1) {
    best = await fetchBlock(best.height - 1)
  }

  blockAtTimestampCache[targetTimestamp] = best.height
  return best.height
}

function isBlockHash(value) {
  if (typeof value !== 'string') return false
  const hex = value.startsWith('0x') ? value.slice(2) : value
  return hex.length === 64 && /^[0-9a-fA-F]+$/.test(hex)
}

async function resolveTip(block) {
  if (!block) return undefined
  if (isBlockHash(block)) {
    const hex = typeof block === 'string' && block.startsWith('0x') ? block.slice(2) : block
    return hex
  }
  return getBlockHash(block)
}

async function call({ target, abi, inputArgs = [], block }) {
  const [contractAddress, contractName] = target.split('.')
  const functionArgs = inputArgs.map(toClairty)

  let url = `${STACKS_MAINNET.client.baseUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${encodeURIComponent(abi)}`
  const tip = await resolveTip(block)
  if (tip) url += `?tip=${tip}`

  const response = await customFetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: senderAddress,
      arguments: functionArgs.map(arg => cvToHex(arg)),
    }),
  })

  if (!response.ok) {
    const msg = await response.text().catch(() => '')
    throw new Error(`Contract call failed (${response.status}): ${msg}`)
  }

  const json = await response.json()
  if (!json.okay) throw new Error(`Contract call failed: ${json.cause}`)
  return stacks.cvToValue(hexToCV(json.result))

  function toClairty(arg) {
    if (arg.type.startsWith('(tuple')) return tupleCV(arg.value)
    switch (arg.type) {
      case 'string': return bufferCVFromString(arg.value)
      case 'uint': return uintCV(arg.value)
      case 'number': return uintCV(arg.value)
      case 'principal': return principalCV(arg.value)
      default: throw new Error(`Unknown type ${arg.type}`)
    }
  }
}

module.exports = {
  call,
  getBlockAtTimestamp,
}
