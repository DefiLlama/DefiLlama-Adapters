// Minimal Substrate storage reader over plain HTTP JSON-RPC (no @polkadot/api).
// Good for plain storage items and (double) maps whose values are made of fixed-width
// integers, options and compacts. Anything that needs chain metadata to decode
// arbitrary nested types should be decoded by hand in the adapter using the SCALE helpers below.
const axios = require('axios')
const bs58 = require('bs58').default
const { blake2b } = require('blakejs')
const { getEnv } = require('../env')

// endpoints are configured in helper/env.js as <CHAIN>_RPC (e.g. ACALA_RPC, KARURA_RPC), comma separated for fallbacks.
// A full URL can also be passed directly instead of a chain name.
function getEndpoints(chain) {
  if (chain.includes('://')) return chain.split(',')
  const endpoint = getEnv(`${chain.toUpperCase()}_RPC`)
  if (!endpoint) throw new Error(`No substrate endpoint configured for ${chain}`)
  return endpoint.split(',').map(i => i.trim()).filter(Boolean)
}

async function rpc(chain, method, params = []) {
  let lastError
  for (const endpoint of getEndpoints(chain)) {
    try {
      const { data } = await axios.post(endpoint, { jsonrpc: '2.0', id: 1, method, params }, { timeout: 60_000 })
      if (data.error) throw new Error(`${method} failed: ${data.error.message}`)
      return data.result
    } catch (e) {
      lastError = e
    }
  }
  throw new Error(`${chain}: ${lastError.message}`)
}

// ---------- xxhash64 / twox ----------

const P1 = 11400714785074694791n
const P2 = 14029467366897019727n
const P3 = 1609587929392839161n
const P4 = 9650029242287828579n
const P5 = 2870177450012600261n
const M64 = (1n << 64n) - 1n

const rotl = (x, r) => ((x << r) | (x >> (64n - r))) & M64
const round = (acc, input) => (rotl((acc + input * P2) & M64, 31n) * P1) & M64
const mergeRound = (acc, val) => ((acc ^ round(0n, val)) * P1 + P4) & M64

function xxhash64(buf, seed = 0n) {
  const len = buf.length
  let p = 0
  let h
  if (len >= 32) {
    let v1 = (seed + P1 + P2) & M64
    let v2 = (seed + P2) & M64
    let v3 = seed
    let v4 = (seed - P1) & M64
    for (; p + 32 <= len; p += 32) {
      v1 = round(v1, buf.readBigUInt64LE(p))
      v2 = round(v2, buf.readBigUInt64LE(p + 8))
      v3 = round(v3, buf.readBigUInt64LE(p + 16))
      v4 = round(v4, buf.readBigUInt64LE(p + 24))
    }
    h = (rotl(v1, 1n) + rotl(v2, 7n) + rotl(v3, 12n) + rotl(v4, 18n)) & M64
    h = mergeRound(h, v1); h = mergeRound(h, v2); h = mergeRound(h, v3); h = mergeRound(h, v4)
  } else {
    h = (seed + P5) & M64
  }
  h = (h + BigInt(len)) & M64
  for (; p + 8 <= len; p += 8) {
    h ^= round(0n, buf.readBigUInt64LE(p))
    h = (rotl(h, 27n) * P1 + P4) & M64
  }
  if (p + 4 <= len) {
    h ^= (BigInt(buf.readUInt32LE(p)) * P1) & M64
    h = (rotl(h, 23n) * P2 + P3) & M64
    p += 4
  }
  for (; p < len; p++) {
    h ^= (BigInt(buf[p]) * P5) & M64
    h = (rotl(h, 11n) * P1) & M64
  }
  h ^= h >> 33n; h = (h * P2) & M64
  h ^= h >> 29n; h = (h * P3) & M64
  h ^= h >> 32n
  return h
}

const u64le = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(n); return b }
const toBuf = (v) => Buffer.isBuffer(v) ? v : typeof v === 'string' && v.startsWith('0x') ? Buffer.from(v.slice(2), 'hex') : Buffer.from(v)

const twox64 = (v) => u64le(xxhash64(toBuf(v), 0n))
const twox128 = (v) => Buffer.concat([u64le(xxhash64(toBuf(v), 0n)), u64le(xxhash64(toBuf(v), 1n))])
const blake2_128 = (v) => Buffer.from(blake2b(toBuf(v), undefined, 16))
const blake2_256 = (v) => Buffer.from(blake2b(toBuf(v), undefined, 32))
const hex = (b) => '0x' + Buffer.from(b).toString('hex')

// ss58 address -> 32 byte account id (1 byte network prefix for prefixes < 64, else 2 bytes; 2 byte checksum)
function ss58Decode(address) {
  if (Buffer.isBuffer(address)) return address // already a raw account id
  const bytes = bs58.decode(address)
  const prefixLen = bytes[0] < 64 ? 1 : 2
  return Buffer.from(bytes.slice(prefixLen, bytes.length - 2))
}

// ---------- SCALE helpers ----------

const encodeU8 = (n) => Buffer.from([n])
const encodeU16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b }
const encodeU32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b }
const encodeU64 = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n)); return b }
const encodeU128 = (n) => { const b = Buffer.alloc(16); let v = BigInt(n); for (let i = 0; i < 16; i++) { b[i] = Number(v & 0xffn); v >>= 8n } return b }

function encodeCompact(n) {
  n = BigInt(n)
  if (n < 64n) return Buffer.from([Number(n) << 2])
  if (n < 16384n) return encodeU16((Number(n) << 2) | 1)
  if (n < 1073741824n) return encodeU32(((Number(n) << 2) | 2) >>> 0)
  const bytes = []
  while (n > 0n) { bytes.push(Number(n & 0xffn)); n >>= 8n }
  return Buffer.from([((bytes.length - 4) << 2) | 3, ...bytes])
}

function decodeUint(value, { offset = 0, bytes = 16 } = {}) {
  if (!value) return 0n
  const b = toBuf(value)
  let n = 0n
  for (let i = bytes - 1; i >= 0; i--) n = (n << 8n) | BigInt(b[offset + i] ?? 0)
  return n
}

// SCALE Compact<uN> -> { value: BigInt, length: bytes consumed }
function decodeCompact(value, offset = 0) {
  const b = toBuf(value)
  const mode = b[offset] & 0b11
  if (mode === 0) return { value: BigInt(b[offset] >> 2), length: 1 }
  if (mode === 1) return { value: BigInt(b.readUInt16LE(offset) >> 2), length: 2 }
  if (mode === 2) return { value: BigInt(b.readUInt32LE(offset) >>> 2), length: 4 }
  const len = (b[offset] >> 2) + 4
  return { value: decodeUint(b, { offset: offset + 1, bytes: len }), length: len + 1 }
}

// Sequential SCALE reader for hand-decoding structs
class ScaleReader {
  constructor(value) { this.buf = toBuf(value); this.offset = 0 }
  get remaining() { return this.buf.length - this.offset }
  bytes(n) { const b = this.buf.subarray(this.offset, this.offset + n); this.offset += n; return b }
  u8() { return this.buf[this.offset++] }
  u16() { const v = this.buf.readUInt16LE(this.offset); this.offset += 2; return v }
  u32() { const v = this.buf.readUInt32LE(this.offset); this.offset += 4; return v }
  u64() { return decodeUint(this.bytes(8), { bytes: 8 }) }
  u128() { return decodeUint(this.bytes(16), { bytes: 16 }) }
  bool() { return this.u8() === 1 }
  compact() { const { value, length } = decodeCompact(this.buf, this.offset); this.offset += length; return value }
  option(fn) { return this.u8() === 0 ? null : fn() }
  vec(fn) { const len = Number(this.compact()); const out = []; for (let i = 0; i < len; i++) out.push(fn()); return out }
  bytesVec() { return this.bytes(Number(this.compact())) }
  string() { return this.bytesVec().toString('utf8') }
}

// ---------- storage ----------

const storagePrefix = (pallet, item) => Buffer.concat([twox128(pallet), twox128(item)])

// key hashers as used in the pallet's storage definition; hashLength = bytes preceding the raw key (0 if key not recoverable)
const hashers = {
  Twox64Concat: { encode: (k) => Buffer.concat([twox64(k), toBuf(k)]), hashLength: 8 },
  Blake2_128Concat: { encode: (k) => Buffer.concat([blake2_128(k), toBuf(k)]), hashLength: 16 },
  Identity: { encode: (k) => toBuf(k), hashLength: 0 },
  Twox128: { encode: (k) => twox128(k), hashLength: 16 },
  Blake2_256: { encode: (k) => blake2_256(k), hashLength: 32 },
}

// keys: [{ hasher, key }] for (double/n) maps; `key`/`hasher` kept for single maps
function storageKey({ pallet, item, key, hasher = 'Twox64Concat', keys = [] }) {
  const parts = [storagePrefix(pallet, item)]
  if (key !== undefined) keys = [{ hasher, key }, ...keys]
  for (const { hasher = 'Twox64Concat', key } of keys) parts.push(hashers[hasher].encode(key))
  return hex(Buffer.concat(parts))
}

// plain item or a single map entry -> raw hex value (or null)
async function getStorage(chain, { pallet, item, key, hasher, keys, at }) {
  return rpc(chain, 'state_getStorage', [storageKey({ pallet, item, key, hasher, keys }), at])
}

async function getStorageBatch(chain, storageKeys, { at } = {}) {
  if (!storageKeys.length) return []
  const [{ changes }] = await rpc(chain, 'state_queryStorageAt', [storageKeys, at])
  const byKey = Object.fromEntries(changes)
  return storageKeys.map(k => byKey[k] ?? null)
}

// every entry of a map (optionally under a partial key for double maps) -> [{ key, value, rest }]
// `rest` is the key buffer after the pallet/item prefix and the given partial keys
async function getStorageEntries(chain, { pallet, item, keys = [], pageSize = 1000, at }) {
  const prefix = storageKey({ pallet, item, keys })
  const allKeys = []
  let startKey
  while (true) {
    const page = await rpc(chain, 'state_getKeysPaged', [prefix, pageSize, startKey, at])
    allKeys.push(...page)
    if (page.length < pageSize) break
    startKey = page[page.length - 1]
  }
  if (!allKeys.length) return []
  const prefixLen = prefix.length - 2
  const values = await getStorageBatch(chain, allKeys, { at })
  return allKeys.map((key, i) => ({ key, value: values[i], rest: Buffer.from(key.slice(2 + prefixLen), 'hex') }))
}

// strip the hash part of a concat hasher from an entry's `rest` buffer
const stripHasher = (rest, hasher = 'Twox64Concat') => rest.subarray(hashers[hasher].hashLength)

// runtime api call, e.g. stateCall(chain, 'CurrenciesApi_account', encodedArgs)
async function stateCall(chain, method, data, { at } = {}) {
  return rpc(chain, 'state_call', [method, hex(toBuf(data)), at])
}

// ---------- common pallets ----------

// frame_system AccountInfo: nonce u32, consumers u32, providers u32, sufficients u32, data { free, reserved, frozen, flags }
// balances are u128 on most chains; pass balanceBytes: 8 for chains with u64 balances (e.g. bittensor)
function decodeAccountInfo(value, { balanceBytes = 16 } = {}) {
  if (!value) return { free: 0n, reserved: 0n, frozen: 0n }
  const r = new ScaleReader(value)
  r.bytes(16)
  const balance = () => decodeUint(r.bytes(balanceBytes), { bytes: balanceBytes })
  return { free: balance(), reserved: balance(), frozen: balance() }
}

async function getSystemAccount(chain, address, { at, balanceBytes } = {}) {
  const value = await getStorage(chain, { pallet: 'System', item: 'Account', key: ss58Decode(address), hasher: 'Blake2_128Concat', at })
  return decodeAccountInfo(value, { balanceBytes })
}

// orml_tokens AccountData: free u128, reserved u128, frozen u128
function decodeOrmlAccountData(value) {
  if (!value) return { free: 0n, reserved: 0n, frozen: 0n }
  const r = new ScaleReader(value)
  return { free: r.u128(), reserved: r.u128(), frozen: r.u128() }
}

// orml Tokens.Accounts(AccountId: Blake2_128Concat, CurrencyId: Twox64Concat)
async function getTokensAccount(chain, address, currencyId, { at } = {}) {
  const value = await getStorage(chain, {
    pallet: 'Tokens', item: 'Accounts', at,
    keys: [{ hasher: 'Blake2_128Concat', key: ss58Decode(address) }, { hasher: 'Twox64Concat', key: currencyId }],
  })
  return decodeOrmlAccountData(value)
}

module.exports = {
  rpc,
  xxhash64,
  twox64,
  twox128,
  blake2_128,
  blake2_256,
  ss58Decode,
  storageKey,
  storagePrefix,
  getStorage,
  getStorageBatch,
  getStorageEntries,
  stripHasher,
  stateCall,
  decodeUint,
  decodeCompact,
  encodeU8,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeU128,
  encodeCompact,
  ScaleReader,
  decodeAccountInfo,
  getSystemAccount,
  decodeOrmlAccountData,
  getTokensAccount,
  toBuf,
  hex,
}
