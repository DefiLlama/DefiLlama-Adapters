// sBTC's bitcoin reserve sits in a single key-path-only P2TR output controlled by the
// signer set's aggregate key. The current aggregate key is published on Stacks by the 
// sBTC registry contract, so derive the reserve address from it instead. The signers' 
// wallet is a key-path-only taproot output, i.e. output key = BIP341 tweak of the aggregate 
// key with an empty merkle root, which is what taprootAddress() below computes.

const axios = require('axios')
const crypto = require('crypto')

const SBTC_REGISTRY = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-registry'
const STACKS_API = 'https://api.hiro.so/v2/contracts/call-read'

// Reserve addresses used by earlier signer keys. They hold dust today, but a rotation is a
// bitcoin transaction like any other, so keep reading them in case a sweep is still in flight.
const RETIRED_RESERVES = [
  'bc1pl033nz4lj7u7wz3l2k2ew3f7af4sdja8r25ernl00thflwempayswr5hvc',
  'bc1prcs82tvrz70jk8u79uekwdfjhd0qhs2mva6e526arycu7fu25zsqhyztuy',
  'bc1p6ys2ervatu00766eeqfmverzegg9fkprn3xjn0ppn70h53qu5vus3yzl0x',
]

// secp256k1
const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn
const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n
const G = [
  0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
  0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
]

const mod = (a, m) => ((a % m) + m) % m
const inverse = (a) => modPow(mod(a, P), P - 2n)

function modPow(base, exp) {
  let result = 1n
  base = mod(base, P)
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % P
    base = (base * base) % P
    exp >>= 1n
  }
  return result
}

function pointAdd(a, b) {
  if (!a) return b
  if (!b) return a
  if (a[0] === b[0] && mod(a[1] + b[1], P) === 0n) return null
  const slope = a[0] === b[0] && a[1] === b[1]
    ? mod(3n * a[0] * a[0] * inverse(2n * a[1]), P)
    : mod((b[1] - a[1]) * inverse(b[0] - a[0]), P)
  const x = mod(slope * slope - a[0] - b[0], P)
  return [x, mod(slope * (a[0] - x) - a[1], P)]
}

function pointMul(scalar, point) {
  let result = null
  let addend = point
  while (scalar > 0n) {
    if (scalar & 1n) result = pointAdd(result, addend)
    addend = pointAdd(addend, addend)
    scalar >>= 1n
  }
  return result
}

// BIP340 lift_x: the point with the given x coordinate and an even y coordinate.
function liftX(x) {
  const ySquared = mod(modPow(x, 3n) + 7n, P)
  const y = modPow(ySquared, (P + 1n) / 4n)
  if (mod(y * y, P) !== ySquared) throw new Error('sbtc: aggregate key is not a valid curve point')
  return [x, y % 2n === 0n ? y : P - y]
}

function taggedHash(tag, message) {
  const tagHash = crypto.createHash('sha256').update(tag).digest()
  return crypto.createHash('sha256').update(Buffer.concat([tagHash, tagHash, message])).digest()
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const BECH32M_CONST = 0x2bc830a3

function polymod(values) {
  const generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const value of values) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ value
    for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= generator[i]
  }
  return chk
}

function hrpExpand(hrp) {
  const high = [], low = []
  for (const char of hrp) {
    high.push(char.charCodeAt(0) >> 5)
    low.push(char.charCodeAt(0) & 31)
  }
  return [...high, 0, ...low]
}

function toBase32(bytes) {
  const result = []
  let acc = 0, bits = 0
  for (const byte of bytes) {
    acc = (acc << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      result.push((acc >> bits) & 31)
    }
  }
  if (bits) result.push((acc << (5 - bits)) & 31)
  return result
}

// Witness v1 addresses use bech32m (BIP350) rather than bech32.
function encodeSegwitAddress(hrp, version, program) {
  const data = [version, ...toBase32(program)]
  const checksum = polymod([...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ BECH32M_CONST
  const tail = []
  for (let i = 0; i < 6; i++) tail.push((checksum >> (5 * (5 - i))) & 31)
  return `${hrp}1${[...data, ...tail].map((i) => BECH32_CHARSET[i]).join('')}`
}

// Key-path-only P2TR: output key = internal key tweaked with an empty merkle root.
function taprootAddress(internalKey) {
  const tweak = mod(BigInt('0x' + taggedHash('TapTweak', internalKey).toString('hex')), N)
  const outputKey = pointAdd(liftX(BigInt('0x' + internalKey.toString('hex'))), pointMul(tweak, G))
  return encodeSegwitAddress('bc', 1, Buffer.from(outputKey[0].toString(16).padStart(64, '0'), 'hex'))
}

async function getAggregatePubkey() {
  const [deployer, contract] = SBTC_REGISTRY.split('.')
  const { data } = await axios.post(`${STACKS_API}/${deployer}/${contract}/get-current-aggregate-pubkey`, {
    sender: deployer,
    arguments: [],
    }, {
    timeout: 30000,
  })
  if (data.okay !== true) throw new Error(`sbtc: registry read failed: ${data.cause}`)
  // Clarity buffer: 0x02, a four byte big endian length, then the bytes themselves.
  const hex = data.result.replace(/^0x/, '')
  if (!hex.startsWith('02')) throw new Error(`sbtc: expected a buffer clarity value, got ${hex.slice(0, 2)}`)
  const length = parseInt(hex.slice(2, 10), 16)
  const pubkey = Buffer.from(hex.slice(10, 10 + length * 2), 'hex')
  if (pubkey.length !== 33) throw new Error(`sbtc: expected a 33 byte pubkey, got ${pubkey.length}`)
  return pubkey.subarray(1) // drop the compressed prefix, taproot uses the x coordinate only
}

async function stacksSBTC() {
  const reserve = taprootAddress(await getAggregatePubkey())
  return [...new Set([...RETIRED_RESERVES, reserve])]
}

module.exports = { stacksSBTC, taprootAddress, getAggregatePubkey }
