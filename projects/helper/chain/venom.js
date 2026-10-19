const crypto = require('crypto')
const { post } = require('../http')

// Venom (Everscale/TVM) has no rpc method to run get-methods, so contract state is read by
// fetching the raw account (bag of cells) over jrpc and decoding the storage cells directly.
const JRPC = 'https://jrpc.venom.foundation/'

// ---------------------------------------------------------------- bag of cells

function parseBoc(b64) {
  const buf = Buffer.from(b64, 'base64')
  let p = 0
  const readUint = (n) => { let v = 0; for (let i = 0; i < n; i++) v = v * 256 + buf[p++]; return v }
  if (buf.readUInt32BE(0) !== 0xb5ee9c72) throw new Error('venom: unsupported boc magic')
  p = 4
  const flags = buf[p++]
  const hasIdx = flags & 0x80
  const sizeBytes = flags & 0x07
  const offBytes = buf[p++]
  const cellsNum = readUint(sizeBytes)
  const rootsNum = readUint(sizeBytes)
  readUint(sizeBytes) // absent
  readUint(offBytes) // total cells size
  const roots = []
  for (let i = 0; i < rootsNum; i++) roots.push(readUint(sizeBytes))
  if (hasIdx) p += cellsNum * offBytes

  const raw = []
  for (let i = 0; i < cellsNum; i++) {
    const d1 = buf[p++], d2 = buf[p++]
    const refsNum = d1 & 7
    const dataLen = Math.ceil(d2 / 2)
    const data = buf.subarray(p, p + dataLen)
    p += dataLen
    let bits = Math.floor(d2 / 2) * 8
    if (d2 % 2) { // last byte is padded with a completion tag: a 1 bit followed by zeros
      const last = data[dataLen - 1]
      let trailing = 0
      while (trailing < 8 && !((last >> trailing) & 1)) trailing++
      bits = (dataLen - 1) * 8 + (7 - trailing)
    }
    const refs = []
    for (let r = 0; r < refsNum; r++) refs.push(readUint(sizeBytes))
    raw.push({ data, bits, refs })
  }
  const cells = raw.map((c) => ({ data: c.data, bits: c.bits, refs: [] }))
  raw.forEach((c, i) => { cells[i].refs = c.refs.map((r) => cells[r]) })
  return cells[roots[0]]
}

class Slice {
  constructor(cell) { this.cell = cell; this.pos = 0; this.ref = 0 }
  bit() {
    if (this.pos >= this.cell.bits) throw new Error('venom: cell underflow')
    const b = (this.cell.data[this.pos >> 3] >> (7 - (this.pos & 7))) & 1
    this.pos++
    return b
  }
  uint(n) { let v = 0n; for (let i = 0; i < n; i++) v = (v << 1n) | BigInt(this.bit()); return v }
  skip(n) { this.pos += n }
  loadRef() { return this.cell.refs[this.ref++] }
  varUint(lenBits) { const len = Number(this.uint(lenBits)); return this.uint(len * 8) }
}

// AccountStuff TL-B (jrpc returns the account without the account$1 tag)
// -> { balance (nanoVENOM), data (contract storage root cell) }
function parseAccount(cell) {
  const s = new Slice(cell)
  // addr_std$10 anycast:(Maybe Anycast) workchain:int8 address:bits256
  if (s.uint(2) !== 2n || s.bit()) throw new Error('venom: unexpected account address type')
  s.skip(8 + 256)
  // StorageInfo: used (cells, bits, public_cells as VarUInteger 7), last_paid:uint32, due_payment:(Maybe Grams)
  s.varUint(3); s.varUint(3); s.varUint(3)
  s.skip(32)
  if (s.bit()) s.varUint(4)
  // AccountStorage: last_trans_lt:uint64 balance:CurrencyCollection state:AccountState
  s.skip(64)
  const balance = s.varUint(4)
  if (s.bit()) s.loadRef() // extra currencies
  if (!s.bit()) throw new Error('venom: account is not active')
  // StateInit: split_depth:(Maybe ## 5) special:(Maybe TickTock) code:(Maybe ^Cell) data:(Maybe ^Cell) ...
  if (s.bit()) s.skip(5)
  if (s.bit()) s.skip(2)
  if (s.bit()) s.loadRef() // code
  if (!s.bit()) throw new Error('venom: account has no data')
  return { balance, data: s.loadRef() }
}

// AccountStuff variant that also returns the code cell (needed for code hashes)
function parseAccountWithCode(cell) {
  const s = new Slice(cell)
  if (s.uint(2) !== 2n || s.bit()) throw new Error('venom: unexpected account address type')
  s.skip(8 + 256)
  s.varUint(3); s.varUint(3); s.varUint(3)
  s.skip(32)
  if (s.bit()) s.varUint(4)
  s.skip(64)
  const balance = s.varUint(4)
  if (s.bit()) s.loadRef()
  if (!s.bit()) throw new Error('venom: account is not active')
  if (s.bit()) s.skip(5)
  if (s.bit()) s.skip(2)
  const code = s.bit() ? s.loadRef() : null
  if (!s.bit()) throw new Error('venom: account has no data')
  return { balance, code, data: s.loadRef() }
}

// ---------------------------------------------------------------- cell hash (ordinary cells)

function cellDepth(cell) {
  if (cell._depth !== undefined) return cell._depth
  cell._depth = cell.refs.length ? Math.max(...cell.refs.map(cellDepth)) + 1 : 0
  return cell._depth
}

function cellHash(cell) {
  if (cell._hash) return cell._hash
  const fullBytes = Math.floor(cell.bits / 8)
  const d1 = cell.refs.length
  const d2 = Math.ceil(cell.bits / 8) + fullBytes
  const dataLen = Math.ceil(cell.bits / 8)
  const data = Buffer.from(cell.data.subarray(0, dataLen))
  if (cell.bits % 8) { // completion tag: 1 bit then zeros
    const used = cell.bits % 8
    data[dataLen - 1] = (data[dataLen - 1] & (0xff << (8 - used))) | (1 << (7 - used))
  }
  const parts = [Buffer.from([d1, d2]), data]
  for (const r of cell.refs) { const d = cellDepth(r); parts.push(Buffer.from([d >> 8, d & 0xff])) }
  for (const r of cell.refs) parts.push(cellHash(r))
  cell._hash = crypto.createHash('sha256').update(Buffer.concat(parts)).digest()
  return cell._hash
}

// ---------------------------------------------------------------- ABI 2.2 storage decoding

function readAddress(s) {
  const tag = Number(s.uint(2))
  if (tag === 0) return null // addr_none
  if (tag !== 2 || s.bit()) throw new Error('venom: unsupported address encoding')
  const wc = Number(BigInt.asIntN(8, s.uint(8)))
  return `${wc}:${s.uint(256).toString(16).padStart(64, '0')}`
}

const typeBits = (type, components) => {
  if (type === 'tuple') return components.reduce(([b, r], c) => {
    const [cb, cr] = typeBits(c.type, c.components)
    return [b + cb, r + cr]
  }, [0, 0])
  if (/^u?int\d+$/.test(type)) return [Number(type.match(/\d+/)[0]), 0]
  if (type === 'bool') return [1, 0]
  if (type === 'address') return [591, 0]
  if (type === 'cell' || type === 'bytes' || type === 'string') return [0, 1]
  if (type.startsWith('map(')) return [1, 1]
  if (type.endsWith('[]')) return [33, 1]
  throw new Error(`venom: unsupported abi type ${type}`)
}

// HashmapE(n, X) node -> [{ key: BigInt, value: Slice }]
function parseHashmap(cell, keyLen) {
  const out = []
  const walk = (c, prefix, n) => {
    const s = new Slice(c)
    let label = 0n, len
    if (!s.bit()) { // hml_short$0 len:(Unary ~n) s:(n * Bit)
      len = 0
      while (s.bit()) len++
      label = s.uint(len)
    } else if (!s.bit()) { // hml_long$10 n:(#<= m) s:(n * Bit)
      len = Number(s.uint(Math.ceil(Math.log2(n + 1))))
      label = s.uint(len)
    } else { // hml_same$11 v:Bit n:(#<= m)
      const v = s.bit()
      len = Number(s.uint(Math.ceil(Math.log2(n + 1))))
      label = v ? (1n << BigInt(len)) - 1n : 0n
    }
    const key = (prefix << BigInt(len)) | label
    const rest = n - len
    if (rest === 0) return out.push({ key, value: s })
    walk(s.loadRef(), (key << 1n), rest - 1)
    walk(s.loadRef(), (key << 1n) | 1n, rest - 1)
  }
  walk(cell, 0n, keyLen)
  return out
}

function readValue(s, type, components) {
  if (/^uint\d+$/.test(type)) return s.uint(Number(type.slice(4)))
  if (/^int\d+$/.test(type)) { const n = Number(type.slice(3)); return BigInt.asIntN(n, s.uint(n)) }
  if (type === 'bool') return !!s.bit()
  if (type === 'address') return readAddress(s)
  if (type === 'cell' || type === 'bytes' || type === 'string') return s.loadRef()
  if (type === 'tuple') { const v = {}; for (const c of components) v[c.name] = readValue(s, c.type, c.components); return v }
  if (type.endsWith('[]')) { // uint32 length + HashmapE(32, T)
    const itemType = type.slice(0, -2)
    const length = Number(s.uint(32))
    const items = s.bit() ? parseHashmap(s.loadRef(), 32) : []
    const arr = new Array(length)
    for (const { key, value } of items) arr[Number(key)] = readMapValue(value, 32, itemType, components)
    return arr
  }
  const m = type.match(/^map\((u?int\d+|address),(.+)\)$/)
  if (m) {
    if (!s.bit()) return new Map()
    const keyLen = m[1] === 'address' ? 267 : Number(m[1].match(/\d+/)[0])
    const entries = parseHashmap(s.loadRef(), keyLen)
    return new Map(entries.map(({ key, value }) => [key, readMapValue(value, keyLen, m[2], components)]))
  }
  throw new Error(`venom: unsupported abi type ${type}`)
}

// map / array values whose max size does not fit next to the key are stored in a ref; a ref'd tuple is
// laid out like top-level storage (max-size chaining), so it goes through decodeFields
function readMapValue(value, keyLen, type, components) {
  const [vBits, vRefs] = typeBits(type, components)
  if (keyLen + vBits <= 1023 && vRefs <= 4) return readValue(value, type, components)
  const cell = value.loadRef()
  return type === 'tuple' ? decodeFields(cell, components) : readValue(new Slice(cell), type, components)
}

// decode a contract data cell given the ABI `fields` list; tuples are flattened field by field. The
// compiler lays storage out by *max* type sizes (address = 591 bits): once the running max size of a
// cell would exceed 1023 bits / 3 refs, the field continues in the cell referenced by the last ref.
// `until` stops after that field name, so fields past it never need to be supported.
function decodeFields(dataCell, fields, until) {
  const flat = []
  const flatten = (list, path) => list.forEach((f) => f.type === 'tuple'
    ? flatten(f.components, [...path, f.name])
    : flat.push({ ...f, path: [...path, f.name] }))
  flatten(fields, [])

  let s = new Slice(dataCell)
  let usedBits = 0, usedRefs = 0
  const result = {}
  for (const f of flat) {
    const [maxBits, maxRefs] = typeBits(f.type, f.components)
    if (usedBits + maxBits > 1023 || usedRefs + maxRefs > 3) {
      if (!s.cell.refs.length) throw new Error('venom: storage ended early')
      s = new Slice(s.cell.refs[s.cell.refs.length - 1])
      usedBits = 0
      usedRefs = 0
    }
    usedBits += maxBits
    usedRefs += maxRefs
    let target = result
    f.path.slice(0, -1).forEach((p) => { target = target[p] = target[p] ?? {} })
    target[f.path[f.path.length - 1]] = readValue(s, f.type, f.components)
    if (f.path.join('.') === until) break
  }
  return result
}

async function getAccount(address, { withCode = false } = {}) {
  const { result, error } = await post(JRPC, { jsonrpc: '2.0', id: 1, method: 'getContractState', params: { address } })
  if (error) throw new Error(`venom: getContractState failed for ${address}: ${error.message}`)
  if (result?.type !== 'exists') throw new Error(`venom: account ${address} does not exist`)
  const cell = parseBoc(result.account)
  return withCode ? parseAccountWithCode(cell) : parseAccount(cell)
}

// every account deployed with the given code (hex code hash), paginated with the jrpc continuation cursor
async function getAccountsByCodeHash(codeHash) {
  const all = []
  let continuation
  do {
    const { result, error } = await post(JRPC, { jsonrpc: '2.0', id: 1, method: 'getAccountsByCodeHash', params: { codeHash, limit: 100, ...(continuation && { continuation }) } })
    if (error) throw new Error(`venom: getAccountsByCodeHash failed: ${error.message}`)
    all.push(...result)
    continuation = result.length === 100 ? result[result.length - 1] : undefined
  } while (continuation)
  return all
}

module.exports = {
  getAccount,
  getAccountsByCodeHash,
  cellHash,
  decodeFields,
  parseBoc,
  parseAccount,
  Slice,
}
