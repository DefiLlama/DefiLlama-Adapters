const crypto = require('crypto')
const { getEnv } = require('../env')

const BASE_URL = 'https://api.mainnet.hiro.so'

const k = getEnv('HIRO_API_KEY') ?? '260ff2d24e32b02'
+'e69c516779e3ddbf5'

async function apiFetch(url, options = {}) {
  const headers = { 'x-api-key': k, ...(options.headers || {}) }
  return fetch(url, { ...options, headers })
}

// ---------------------------------------------------------------------------
// c32check address encoding (Crockford base32 variant used by Stacks)
// ---------------------------------------------------------------------------

const C32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function c32checksum(dataHex) {
  const inner = crypto.createHash('sha256').update(Buffer.from(dataHex, 'hex')).digest()
  const outer = crypto.createHash('sha256').update(inner).digest()
  return outer.subarray(0, 4).toString('hex')
}

function c32encode(inputHex) {
  if (inputHex.length % 2 !== 0) inputHex = '0' + inputHex
  const buf = Buffer.from(inputHex.toLowerCase(), 'hex')
  let leadingZeroBytes = 0
  while (leadingZeroBytes < buf.length && buf[leadingZeroBytes] === 0) leadingZeroBytes++
  let digits = ''
  let val = buf.length ? BigInt('0x' + buf.toString('hex')) : 0n
  while (val > 0n) {
    digits = C32_ALPHABET[Number(val % 32n)] + digits
    val /= 32n
  }
  return C32_ALPHABET[0].repeat(leadingZeroBytes) + digits
}

function c32normalize(c32input) {
  return c32input.toUpperCase().replace(/O/g, '0').replace(/L|I/g, '1')
}

function c32decode(c32input) {
  c32input = c32normalize(c32input)
  if (!new RegExp(`^[${C32_ALPHABET}]*$`).test(c32input)) throw new Error('Not a c32-encoded string')
  let leadingZeroChars = 0
  while (leadingZeroChars < c32input.length && c32input[leadingZeroChars] === C32_ALPHABET[0]) leadingZeroChars++
  let val = 0n
  for (const char of c32input) val = val * 32n + BigInt(C32_ALPHABET.indexOf(char))
  let hex = val.toString(16)
  if (hex === '0') hex = ''
  if (hex.length % 2 !== 0) hex = '0' + hex
  return '00'.repeat(leadingZeroChars) + hex
}

function c32address(version, hash160hex) {
  if (!/^[0-9a-fA-F]{40}$/.test(hash160hex)) throw new Error('Invalid argument: not a hash160 hex string')
  const versionHex = version.toString(16).padStart(2, '0')
  const checksumHex = c32checksum(versionHex + hash160hex.toLowerCase())
  return `S${C32_ALPHABET[version]}${c32encode(hash160hex.toLowerCase() + checksumHex)}`
}

function c32addressDecode(c32addr) {
  if (c32addr.length <= 5) throw new Error('Invalid c32 address: invalid length')
  if (c32addr[0] !== 'S') throw new Error('Invalid c32 address: must start with "S"')
  const normalized = c32normalize(c32addr.slice(1))
  const version = C32_ALPHABET.indexOf(normalized[0])
  const dataHex = c32decode(normalized.slice(1))
  const checksum = dataHex.slice(-8)
  const payload = dataHex.slice(0, -8)
  const versionHex = version.toString(16).padStart(2, '0')
  if (c32checksum(versionHex + payload) !== checksum) throw new Error('Invalid c32check string: checksum mismatch')
  return [version, payload]
}

// ---------------------------------------------------------------------------
// Clarity value serialization (SIP-005 wire format)
// ---------------------------------------------------------------------------

const WireType = {
  int: 0x00,
  uint: 0x01,
  buffer: 0x02,
  true: 0x03,
  false: 0x04,
  address: 0x05,
  contract: 0x06,
  ok: 0x07,
  err: 0x08,
  none: 0x09,
  some: 0x0a,
  list: 0x0b,
  tuple: 0x0c,
  ascii: 0x0d,
  utf8: 0x0e,
}

function serializeAddress(address) {
  const [version, hash160] = c32addressDecode(address)
  return Buffer.concat([Buffer.from([version]), Buffer.from(hash160, 'hex')])
}

function serializeLPString(str) {
  const bytes = Buffer.from(str, 'ascii')
  if (bytes.length > 128) throw new Error(`String too long: ${str}`)
  return Buffer.concat([Buffer.from([bytes.length]), bytes])
}

function serializeCV(cv) {
  switch (cv.type) {
    case 'uint': {
      const value = BigInt(cv.value)
      if (value < 0n || value >= 2n ** 128n) throw new Error(`Cannot construct unsigned clarity integer from value: ${cv.value}`)
      return Buffer.concat([Buffer.from([WireType.uint]), Buffer.from(value.toString(16).padStart(32, '0'), 'hex')])
    }
    case 'buffer': {
      const bytes = Buffer.from(cv.value, 'hex')
      const len = Buffer.alloc(4)
      len.writeUInt32BE(bytes.length)
      return Buffer.concat([Buffer.from([WireType.buffer]), len, bytes])
    }
    case 'address':
      return Buffer.concat([Buffer.from([WireType.address]), serializeAddress(cv.value)])
    case 'contract': {
      const [address, contractName] = cv.value.split('.')
      return Buffer.concat([Buffer.from([WireType.contract]), serializeAddress(address), serializeLPString(contractName)])
    }
    default:
      throw new Error(`Serialization not supported for clarity type: ${cv.type}`)
  }
}

function cvToHex(cv) {
  return '0x' + serializeCV(cv).toString('hex')
}

function uintCV(value) {
  return { type: 'uint', value: BigInt(value) }
}

function bufferCVFromString(str) {
  return { type: 'buffer', value: Buffer.from(str, 'ascii').toString('hex') }
}

function principalCV(value) {
  return value.includes('.') ? { type: 'contract', value } : { type: 'address', value }
}

// ---------------------------------------------------------------------------
// Clarity value deserialization + cvToValue (mirrors @stacks/transactions v7)
// ---------------------------------------------------------------------------

function deserializeCV(hex) {
  const bytes = Buffer.from(hex.startsWith('0x') ? hex.slice(2) : hex, 'hex')
  const state = { bytes, offset: 0 }
  return readCV(state)
}

function readCV(state) {
  const { bytes } = state
  const tag = bytes[state.offset++]
  switch (tag) {
    case WireType.int: {
      const raw = bytes.subarray(state.offset, state.offset += 16)
      let value = BigInt('0x' + raw.toString('hex'))
      if (value >= 2n ** 127n) value -= 2n ** 128n  // two's complement
      return { type: 'int', value }
    }
    case WireType.uint: {
      const raw = bytes.subarray(state.offset, state.offset += 16)
      return { type: 'uint', value: BigInt('0x' + raw.toString('hex')) }
    }
    case WireType.buffer: {
      const len = bytes.readUInt32BE(state.offset); state.offset += 4
      const raw = bytes.subarray(state.offset, state.offset += len)
      return { type: 'buffer', value: raw.toString('hex') }
    }
    case WireType.true: return { type: 'true', value: true }
    case WireType.false: return { type: 'false', value: false }
    case WireType.address:
      return { type: 'address', value: readAddress(state) }
    case WireType.contract: {
      const address = readAddress(state)
      const nameLen = bytes[state.offset++]
      const name = bytes.subarray(state.offset, state.offset += nameLen).toString('ascii')
      return { type: 'contract', value: `${address}.${name}` }
    }
    case WireType.ok: return { type: 'ok', value: readCV(state) }
    case WireType.err: return { type: 'err', value: readCV(state) }
    case WireType.none: return { type: 'none' }
    case WireType.some: return { type: 'some', value: readCV(state) }
    case WireType.list: {
      const len = bytes.readUInt32BE(state.offset); state.offset += 4
      const value = []
      for (let i = 0; i < len; i++) value.push(readCV(state))
      return { type: 'list', value }
    }
    case WireType.tuple: {
      const len = bytes.readUInt32BE(state.offset); state.offset += 4
      const value = {}
      for (let i = 0; i < len; i++) {
        const nameLen = bytes[state.offset++]
        const name = bytes.subarray(state.offset, state.offset += nameLen).toString('ascii')
        value[name] = readCV(state)
      }
      return { type: 'tuple', value }
    }
    case WireType.ascii: {
      const len = bytes.readUInt32BE(state.offset); state.offset += 4
      const raw = bytes.subarray(state.offset, state.offset += len)
      return { type: 'ascii', value: raw.toString('ascii') }
    }
    case WireType.utf8: {
      const len = bytes.readUInt32BE(state.offset); state.offset += 4
      const raw = bytes.subarray(state.offset, state.offset += len)
      return { type: 'utf8', value: raw.toString('utf8') }
    }
    default:
      throw new Error(`Cannot recognize Clarity Type: ${tag}`)
  }
}

function readAddress(state) {
  const version = state.bytes[state.offset++]
  const hash160 = state.bytes.subarray(state.offset, state.offset += 20).toString('hex')
  return c32address(version, hash160)
}

function cvToValue(cv, strictJsonCompat = false) {
  switch (cv.type) {
    case 'true': return true
    case 'false': return false
    case 'int':
    case 'uint':
      return strictJsonCompat ? cv.value.toString() : cv.value
    case 'buffer': return `0x${cv.value}`
    case 'none': return null
    case 'some': return cvToJSON(cv.value)
    case 'ok': return cvToJSON(cv.value)
    case 'err': return cvToJSON(cv.value)
    case 'address':
    case 'contract':
      return cv.value
    case 'list': return cv.value.map(cvToJSON)
    case 'tuple': {
      const result = {}
      Object.keys(cv.value).forEach(key => { result[key] = cvToJSON(cv.value[key]) })
      return result
    }
    case 'ascii':
    case 'utf8':
      return cv.value
  }
}

function cvToJSON(cv) {
  switch (cv.type) {
    case 'err': return { type: getCVTypeString(cv), value: cvToValue(cv, true), success: false }
    case 'ok': return { type: getCVTypeString(cv), value: cvToValue(cv, true), success: true }
    default: return { type: getCVTypeString(cv), value: cvToValue(cv, true) }
  }
}

function getCVTypeString(cv) {
  switch (cv.type) {
    case 'true':
    case 'false':
      return 'bool'
    case 'int': return 'int'
    case 'uint': return 'uint'
    case 'buffer': return `(buff ${Math.ceil(cv.value.length / 2)})`
    case 'none': return '(optional none)'
    case 'some': return `(optional ${getCVTypeString(cv.value)})`
    case 'err': return `(response UnknownType ${getCVTypeString(cv.value)})`
    case 'ok': return `(response ${getCVTypeString(cv.value)} UnknownType)`
    case 'address':
    case 'contract':
      return 'principal'
    case 'list': return `(list ${cv.value.length} ${cv.value.length ? getCVTypeString(cv.value[0]) : 'UnknownType'})`
    case 'tuple': return `(tuple ${Object.keys(cv.value).map(key => `(${key} ${getCVTypeString(cv.value[key])})`).join(' ')})`
    case 'ascii': return `(string-ascii ${Buffer.from(cv.value, 'ascii').length})`
    case 'utf8': return `(string-utf8 ${Buffer.from(cv.value, 'utf8').length})`
  }
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

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
  const url = `${BASE_URL}/extended/v2/blocks/${height}`
  const response = await apiFetch(url)
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
    const latestResp = await apiFetch(`${BASE_URL}/extended/v2/blocks?limit=1`)
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

  let url = `${BASE_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${encodeURIComponent(abi)}`
  const tip = await resolveTip(block)
  if (tip) url += `?tip=${tip}`

  const response = await apiFetch(url, {
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
  return cvToValue(deserializeCV(json.result))

  function toClairty(arg) {
    switch (arg.type) {
      case 'string': return bufferCVFromString(arg.value)
      case 'uint': return uintCV(arg.value)
      case 'number': return uintCV(arg.value)
      case 'principal': return principalCV(arg.value)
      default: throw new Error(`Unknown type ${arg.type}`)
    }
  }
}

async function getJson(url) {
  const response = await apiFetch(url)
  if (!response.ok) {
    const msg = await response.text().catch(() => '')
    throw new Error(`Failed to get ${url}: ${response.status} ${msg}`)
  }
  return response.json()
}

// STX balance of any principal (standard or contract), optionally at a given block
async function getStxBalance(principal, block) {
  const tip = await resolveTip(block)
  let url = `${BASE_URL}/v2/accounts/${principal}?proof=0`
  if (tip) url += `&tip=${tip}`
  const { balance } = await getJson(url)
  return BigInt(balance).toString()
}

module.exports = {
  call,
  getBlockAtTimestamp,
  getJson,
  getStxBalance,
}
