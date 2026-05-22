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
const BLOCK_TIME_ANCHORS = [
  { height: 1,       time: 1610645304 },
  { height: 100000,  time: 1679912897 },
  { height: 140000,  time: 1708389420 },
  { height: 160000,  time: 1722366824 },
  { height: 171355,  time: 1729880265 },
  { height: 180000,  time: 1730434793 },
  { height: 200000,  time: 1731241700 },
  { height: 220000,  time: 1731752958 },
  { height: 231708,  time: 1731976023 },
  { height: 307999,  time: 1733685896 },
  { height: 498146,  time: 1737558943 },
  { height: 669248,  time: 1740393688 },
  { height: 793801,  time: 1742225748 },
  { height: 1023399, time: 1745499538 },
  { height: 1384524, time: 1748666644 },
  { height: 1467463, time: 1749012823 },
  { height: 2007404, time: 1751516354 },
  { height: 2475460, time: 1754110089 },
  { height: 3487019, time: 1757736297 },
  { height: 4043665, time: 1759903744 },
  { height: 4746510, time: 1763052608 },
  { height: 5239155, time: 1765409601 },
  { height: 6174748, time: 1769618139 },
  { height: 6494525, time: 1770863934 },
  { height: 6937411, time: 1772584174 },
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

  if (targetTimestamp <= BLOCK_TIME_ANCHORS[0].time) {
    blockAtTimestampCache[targetTimestamp] = 1
    return 1
  }

  let lo = BLOCK_TIME_ANCHORS[0]
  let hi = BLOCK_TIME_ANCHORS[BLOCK_TIME_ANCHORS.length - 1]
  for (let i = 0; i < BLOCK_TIME_ANCHORS.length - 1; i++) {
    if (BLOCK_TIME_ANCHORS[i].time <= targetTimestamp && BLOCK_TIME_ANCHORS[i + 1].time > targetTimestamp) {
      lo = BLOCK_TIME_ANCHORS[i]
      hi = BLOCK_TIME_ANCHORS[i + 1]
      break
    }
  }

  if (targetTimestamp >= hi.time) {
    const latestResp = await customFetchFn(`${STACKS_MAINNET.client.baseUrl}/extended/v2/blocks?limit=1`)
    const latest = (await latestResp.json()).results[0]
    if (targetTimestamp >= latest.block_time) {
      blockAtTimestampCache[targetTimestamp] = latest.height
      return latest.height
    }
    hi = { height: latest.height, time: latest.block_time }
  }

  const fraction = (targetTimestamp - lo.time) / (hi.time - lo.time)
  let guess = Math.floor(lo.height + fraction * (hi.height - lo.height))
  guess = Math.max(lo.height, Math.min(hi.height, guess))

  let best = await fetchBlock(guess)

  if (best.block_time > targetTimestamp || Math.abs(best.block_time - targetTimestamp) > 30) {
    const localRate = (hi.time - lo.time) / (hi.height - lo.height)
    const correction = Math.round((targetTimestamp - best.block_time) / localRate)
    const corrected = Math.max(lo.height, Math.min(hi.height, guess + correction))
    if (corrected !== guess) {
      best = await fetchBlock(corrected)
    }
  }

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
