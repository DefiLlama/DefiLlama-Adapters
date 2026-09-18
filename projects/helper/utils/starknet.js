// Minimal, dependency-free replacement for the parts of starknet.js that the
// adapters used: selector hashing, address formatting and Cairo ABI
// encoding/decoding. Output shapes intentionally mirror starknet.js v5
// (CallData.parse / Contract.populate) so existing adapters keep working:
//   - scalars (felt, felt252, uN, ContractAddress, ...) decode to BigInt
//   - core::bool decodes to boolean
//   - core::integer::u256 decodes to a single BigInt (low + high << 128)
//   - bare Cairo 0 "Uint256" WITHOUT a struct definition decodes as ONE felt
//     (that is what starknet.js did, and some adapters reordered their ABIs
//     around it); with a struct definition it decodes to { low, high }
//   - structs decode to objects keyed by member name, tuples to objects keyed
//     by index (or member name for Cairo 0 named tuples), arrays to arrays
//   - a function with a single unnamed output returns the value directly,
//     otherwise an object keyed by output name
const { keccak256, toUtf8Bytes } = require('ethers')

const MASK_250 = 2n ** 250n - 1n
const ADDR_BOUND = 2n ** 251n - 256n
const MASK_128 = 2n ** 128n - 1n

// ---------- numbers / addresses / selectors ----------

function toBigInt(value) {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(value)
  if (typeof value === 'string') return BigInt(value.trim())
  if (typeof value === 'boolean') return value ? 1n : 0n
  throw new Error(`starknet: cannot convert ${value} to BigInt`)
}

function toHex(value) {
  return '0x' + toBigInt(value).toString(16)
}

function addAddressPadding(address) {
  return '0x' + toBigInt(address).toString(16).padStart(64, '0')
}

function validateAndParseAddress(address) {
  const n = toBigInt(address)
  if (n < 0n || n >= ADDR_BOUND) throw new Error(`Starknet Address out of range: ${address}`)
  return addAddressPadding(n)
}

// starknet_keccak: keccak256 of the utf8 name, masked to 250 bits
function starknetKeccak(str) {
  return BigInt(keccak256(toUtf8Bytes(str))) & MASK_250
}

function getSelectorFromName(name) {
  return toHex(starknetKeccak(name))
}

// ---------- ABI type helpers ----------

const isLen = (name) => /_len$/.test(name ?? '')
const isCairo1Type = (type) => type.includes('::')
const isTypeArray = (type) => /\*/.test(type) || type.startsWith('core::array::Array::') || type.startsWith('core::array::Span::')
const isTypeTuple = (type) => /^\(.*\)$/.test(type)
const isTypeU256 = (type) => type === 'core::integer::u256'
const isTypeBool = (type) => type === 'core::bool'
const isTypeOption = (type) => type.startsWith('core::option::Option::')
const isTypeResult = (type) => type.startsWith('core::result::Result::')

function getArrayType(type) {
  if (isCairo1Type(type)) return type.substring(type.indexOf('<') + 1, type.lastIndexOf('>'))
  return type.replace('*', '')
}

// "(a, (b, c), core::array::Array::<x>)" -> ["a", "(b, c)", "core::array::Array::<x>"]
// Cairo 0 named tuples "(x: felt, y: felt)" -> [{ name: 'x', type: 'felt' }, ...]
function extractTupleMemberTypes(type) {
  const inner = type.replace(/\s/g, '').slice(1, -1)
  const members = []
  let depth = 0, current = ''
  for (const ch of inner) {
    if (ch === '(' || ch === '<') depth++
    else if (ch === ')' || ch === '>') depth--
    if (ch === ',' && depth === 0) {
      members.push(current)
      current = ''
    } else current += ch
  }
  if (current) members.push(current)
  return members.map((m) => {
    if (isCairo1Type(m) || !m.includes(':')) return m
    const idx = m.indexOf(':')
    return { name: m.slice(0, idx), type: m.slice(idx + 1) }
  })
}

function getAbiStructs(abi) {
  const structs = {}
  abi.forEach((entry) => { if (entry && entry.type === 'struct') structs[entry.name] = entry })
  return structs
}

function getAbiEnums(abi) {
  const enums = {}
  abi.forEach((entry) => { if (entry && entry.type === 'enum') enums[entry.name] = entry })
  delete enums['core::bool']
  return enums
}

// ---------- calldata encoding ----------

const isHexString = (v) => /^0x[0-9a-fA-F]+$/.test(v)
const isDecimalString = (v) => /^\d+$/.test(v)

// encode a single felt (returns hex string)
function felt(value) {
  if (typeof value === 'bigint' || typeof value === 'number' || typeof value === 'boolean') return toHex(value)
  if (typeof value === 'string') {
    const v = value.trim()
    if (isHexString(v) || isDecimalString(v)) return toHex(v)
    // Cairo short string
    const bytes = Buffer.from(v, 'utf8')
    if (bytes.length > 31) throw new Error(`starknet: short string too long: ${value}`)
    return '0x' + (bytes.toString('hex') || '0')
  }
  throw new Error(`starknet: cannot encode ${JSON.stringify(value)} as felt`)
}

function encodeU256(value) {
  if (value !== null && typeof value === 'object') return [felt(value.low), felt(value.high)]
  const n = toBigInt(value)
  return [toHex(n & MASK_128), toHex(n >> 128n)]
}

function encodeValue(value, type, structs, enums) {
  if (value === undefined) throw new Error(`starknet: missing parameter for type ${type}`)
  if (Array.isArray(value)) {
    const itemType = getArrayType(type)
    const out = [felt(value.length)]
    value.forEach((v) => out.push(...encodeValue(v, itemType, structs, enums)))
    return out
  }
  if (structs[type] && structs[type].members?.length) {
    if (isTypeU256(type)) return encodeU256(value)
    const out = []
    structs[type].members.forEach((m) => out.push(...encodeValue(value[m.name], m.type, structs, enums)))
    return out
  }
  if (isTypeTuple(type)) {
    const memberTypes = extractTupleMemberTypes(type)
    const elements = Object.values(value)
    if (elements.length !== memberTypes.length) throw new Error(`starknet: tuple size mismatch for ${type}`)
    const out = []
    memberTypes.forEach((m, i) => out.push(...encodeValue(elements[i], m.type ?? m, structs, enums)))
    return out
  }
  if (isTypeU256(type)) return encodeU256(value)
  if (enums[type]) throw new Error(`starknet: enum inputs are not supported (${type})`)
  if (typeof value === 'object') throw new Error(`starknet: parameter ${JSON.stringify(value)} does not match abi type ${type}`)
  return [felt(value)]
}

/**
 * Encode function arguments into calldata (array of hex felts)
 * @param {object} fnAbi   function abi entry
 * @param {Array} params   positional arguments
 * @param {Array} allAbi   struct/enum definitions referenced by the function
 */
function encodeCalldata(fnAbi, params = [], allAbi = []) {
  if (!Array.isArray(params)) params = [params]
  const structs = getAbiStructs([fnAbi, ...allAbi])
  const enums = getAbiEnums([fnAbi, ...allAbi])
  const inputs = fnAbi.inputs ?? []
  const calldata = []
  let idx = 0
  for (const input of inputs) {
    // Cairo 0: `foo_len` inputs are derived from the array that follows
    if (isLen(input.name) && !isCairo1Type(input.type)) continue
    calldata.push(...encodeValue(params[idx++], input.type, structs, enums))
  }
  return calldata
}

// ---------- output decoding ----------

function next(it) {
  const { value, done } = it.next()
  if (done) throw new Error('starknet: response too short for abi')
  return value
}

function decodeBase(type, it) {
  if (isTypeBool(type)) return Boolean(BigInt(next(it)))
  if (isTypeU256(type)) {
    const low = BigInt(next(it))
    const high = BigInt(next(it))
    return (high << 128n) + low
  }
  return BigInt(next(it))
}

function decodeValue(it, type, structs, enums) {
  if (type === '()') return {}
  if (isTypeU256(type)) return decodeBase(type, it)
  if (isTypeArray(type)) {
    const itemType = getArrayType(type)
    const len = BigInt(next(it))
    const out = []
    while (out.length < len) out.push(decodeValue(it, itemType, structs, enums))
    return out
  }
  if (structs[type]) {
    const out = {}
    structs[type].members.forEach((m) => { out[m.name] = decodeValue(it, m.type, structs, enums) })
    return out
  }
  if (enums[type]) {
    const variantNum = Number(BigInt(next(it)))
    const variant = enums[type].variants[variantNum]
    if (!variant) throw new Error(`starknet: unknown variant ${variantNum} for ${type}`)
    const content = decodeValue(it, variant.type, structs, enums)
    if (isTypeOption(type)) return variantNum === 0 ? content : undefined
    if (isTypeResult(type)) return variantNum === 0 ? { Ok: content } : { Err: content }
    return { [variant.name]: content }
  }
  if (isTypeTuple(type)) {
    const out = {}
    extractTupleMemberTypes(type).forEach((m, i) => {
      const name = m.name ?? i
      out[name] = decodeValue(it, m.type ?? m, structs, enums)
    })
    return out
  }
  return decodeBase(type, it)
}

function decodeField(it, output, structs, enums, parsed) {
  const { name, type } = output
  if (isLen(name)) return BigInt(next(it))
  if (structs[type] || isTypeTuple(type) || enums[type]) return decodeValue(it, type, structs, enums)
  if (isTypeArray(type)) {
    if (isCairo1Type(type)) return decodeValue(it, type, structs, enums)
    // Cairo 0 `foo: felt*` is preceded by a `foo_len: felt` output
    const out = []
    const len = parsed[`${name}_len`] ?? 0n
    const itemType = type.replace('*', '')
    while (out.length < len) out.push(decodeValue(it, itemType, structs, enums))
    return out
  }
  return decodeBase(type, it)
}

/**
 * Decode a starknet_call result according to the function abi
 * @param {object} fnAbi   function abi entry
 * @param {Array} result   array of felts returned by the node
 * @param {Array} allAbi   struct/enum definitions referenced by the function
 */
function decodeOutput(fnAbi, result, allAbi = []) {
  const structs = getAbiStructs([fnAbi, ...allAbi])
  const enums = getAbiEnums([fnAbi, ...allAbi])
  const it = result.flat()[Symbol.iterator]()
  const parsed = {}
  const outputs = fnAbi.outputs ?? []
  outputs.forEach((output, idx) => {
    const key = output.name ?? idx
    parsed[key] = decodeField(it, output, structs, enums, parsed)
    if (parsed[key] && parsed[`${key}_len`]) delete parsed[`${key}_len`]
  })
  return Object.keys(parsed).length === 1 && 0 in parsed ? parsed[0] : parsed
}

const number = { toHex, toBigInt, toBN: toBigInt, hexToDecimalString: (v) => toBigInt(v).toString() }

module.exports = {
  toBigInt,
  toHex,
  number,
  addAddressPadding,
  validateAndParseAddress,
  starknetKeccak,
  getSelectorFromName,
  encodeCalldata,
  decodeOutput,
}
