// ZEC balances via SoChain v3 (keyless). The SDK's Blockchair path throttles
// and blacklists aggressively (HTTP 430 observed 2026-10-13), so this helper
// owns its transport instead of renting a throttled one. SoChain verified
// live 2026-10-13: 9,598.18 ZEC on the first Binance PoR wallet.
const { get } = require('../http')

const CHAIN = 'zcash'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
// Zcash transparent version prefixes (2 bytes): t1 P2PKH 0x1cb8, t3 P2SH 0x1cbd
const VERSIONS = [0x1cb8, 0x1cbd]

function base58Decode(s) {
  let n = 0n
  for (const c of s) {
    const digit = ALPHABET.indexOf(c)
    if (digit < 0) throw new Error(`zcash: invalid base58 char in address ${s}`)
    n = n * 58n + BigInt(digit)
  }
  let hex = n.toString(16)
  if (hex.length % 2) hex = '0' + hex
  const bytes = Buffer.from(hex, 'hex')
  // t-addrs decode to 26 bytes: 2-byte version + 20-byte hash + 4-byte checksum
  const pad = Buffer.alloc(Math.max(0, 26 - bytes.length))
  const raw = Buffer.concat([pad, bytes])
  let leadingOnes = 0
  for (const c of s) { if (c === '1') leadingOnes++; else break }
  let leadingZeros = 0
  for (const b of raw) { if (b === 0) leadingZeros++; else break }
  if (leadingOnes !== leadingZeros) throw new Error(`zcash: non-canonical address ${s}`)
  return raw
}

// strict t-address check: 26 bytes, valid checksum, t1/t3 version only.
// Shielded addresses (zs/zu) and anything else throw instead of pricing $0.
function assertTransparent(addr) {
  const raw = base58Decode(addr)
  if (raw.length !== 26) throw new Error(`zcash: bad address length for ${addr}`)
  const crypto = require('crypto')
  const payload = raw.slice(0, 22)
  const check = crypto.createHash('sha256').update(crypto.createHash('sha256').update(payload).digest()).digest().slice(0, 4)
  if (!check.equals(raw.slice(22))) throw new Error(`zcash: checksum failed for ${addr}`)
  const ver = (raw[0] << 8) | raw[1]
  if (!VERSIONS.includes(ver)) throw new Error(`zcash: unsupported version for ${addr}`)
}

// confirmed ZEC (decimal string) for one transparent address; throws on
// anything else (fail-loud: a silent $0 would be worse than no update)
async function getBalance(addr) {
  assertTransparent(addr)
  let lastErr
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await get(`https://sochain.com/api/v3/balance/ZEC/${addr}`)
      const confirmed = res && res.data && res.data.confirmed
      const amount = typeof confirmed === 'string' ? Number(confirmed) : NaN
      if (res && res.status === 'success' && Number.isFinite(amount) && amount >= 0) return amount
      throw new Error(`zcash: malformed result for ${addr}`)
    } catch (e) {
      lastErr = e
      await sleep(1000)
    }
  }
  throw new Error(`zcash: giving up on ${addr}: ${lastErr && lastErr.message}`)
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('zcash', balance)
    await sleep(1000) // SoChain keyless tier is paced, not parallelized
  }
  return api.getBalances()
}

module.exports = {
  getBalance,
  sumTokens,
}
