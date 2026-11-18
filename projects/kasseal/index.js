const sdk = require('@defillama/sdk')
const { blake2b } = require('blakejs')
const { PromisePool } = require('@supercharge/promise-pool')
const { get } = require('../helper/http')

// Kasseal: KCC-20 token launchpad on Kaspa L1. Each token's bonding curve is one covenant cell (a P2SH output) holding
// the KAS raised; its redeem script carries the curve state, including the trade fees accrued in the cell and not yet
// swept (those are not locked value).
//
// - Discovery: Kasseal's indexer lists the addresses of the live curve cells (API docs:
//   https://api.kasseal.com/v1/openapi.yaml, GET /metrics/cells). Outside venues shown on Kasseal are never listed.
// - KAS: each address's balance is read on chain (the SDK's Kaspa reader, api.kaspa.org).
// - Unswept fees: read from the curve state inside the cell's redeem script. A live P2SH cell's script is not revealed
//   on chain until it is spent, so the script is fetched from Kasseal's indexer and checked against the chain: its
//   blake2b-256 must equal the script hash the address itself encodes, so any other script is rejected.
const CELLS = 'https://api.kasseal.com/v1/metrics/cells'
const SCRIPTS = 'https://api.kasseal.com/v1/scripts/'

// Curve redeem script: state at offset 1 = push32 tokenCovId | push8 lotsSold | push8 feeAccrued | push1 phase,
// each int 8 bytes little-endian (sign in the top bit).
function feeAccruedOf(script) {
  const b = Buffer.from(script, 'hex')
  if (b.length < 53 || b[1] !== 0x20 || b[34] !== 0x08 || b[43] !== 0x08 || b[52] !== 0x01) throw new Error('kasseal: unexpected curve script layout')
  if (b[51] & 0x80) throw new Error('kasseal: negative accrued fee')
  let v = 0n
  for (let i = 51; i >= 44; i--) v = (v << 8n) | BigInt(b[i])
  return v
}

// The P2SH script hash a Kaspa address encodes (version byte 8 + 32-byte hash, base32 with an 8-character checksum).
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
function scriptHashOf(address) {
  const data = address.split(':')[1].slice(0, -8)
  let acc = 0, bits = 0
  const out = []
  for (const ch of data) {
    const v = CHARSET.indexOf(ch)
    if (v < 0) throw new Error(`kasseal: bad address ${address}`)
    acc = (acc << 5) | v
    bits += 5
    if (bits >= 8) { bits -= 8; out.push((acc >> bits) & 0xff) }
  }
  if (out[0] !== 8 || out.length < 33) throw new Error(`kasseal: not a P2SH address ${address}`)
  return Buffer.from(out.slice(1, 33)).toString('hex')
}

async function feeIn(address) {
  const hash = scriptHashOf(address)
  const { redeemScript } = await get(SCRIPTS + hash)
  if (Buffer.from(blake2b(Buffer.from(redeemScript, 'hex'), null, 32)).toString('hex') !== hash) throw new Error(`kasseal: script does not match ${address}`)
  return feeAccruedOf(redeemScript)
}

// Live curve cells by token (one per token).
async function liveCurves() {
  const { cells } = await get(CELLS)
  return new Map(cells.filter((c) => c.kind === 'curve').map((c) => [c.tokenId, c.address]))
}

// KAS locked in each address, after its unswept fees; 0 for an address that holds nothing.
async function lockedAt(addresses) {
  const balances = await sdk.chains.utxo.getBalances({ chain: 'kaspa', addresses })
  const { results, errors } = await PromisePool.withConcurrency(5).for(addresses).process(async (address) => {
    const amount = BigInt(String(balances[address] ?? 0))
    if (amount === 0n) return [address, 0n]
    const fee = await feeIn(address)
    return [address, amount > fee ? amount - fee : 0n]
  })
  if (errors.length) throw errors[0]
  return new Map(results)
}

// A trade moves a curve to a new address (its state is in its script). A curve that reads empty was traded between
// the listing and the read: list again and read its new address, a few times at most. Each token counts once.
const ATTEMPTS = 3

async function tvl(api) {
  let curves = await liveCurves()
  if (!curves.size) return // every curve has graduated: nothing locked in curves
  const locked = new Map() // tokenId -> sompi
  let pending = [...curves.keys()]
  for (let attempt = 1; pending.length; attempt++) {
    const read = await lockedAt([...new Set(pending.map((t) => curves.get(t)))])
    const empty = []
    for (const t of pending) {
      const v = read.get(curves.get(t))
      if (v > 0n) locked.set(t, v)
      else empty.push(t)
    }
    if (!empty.length || attempt === ATTEMPTS) break
    const before = curves
    curves = await liveCurves()
    // Read again only the tokens still live whose curve moved; a token no longer listed has graduated.
    pending = empty.filter((t) => curves.has(t) && curves.get(t) !== before.get(t))
  }
  const sompi = [...locked.values()].reduce((a, b) => a + b, 0n)
  api.addCGToken('kaspa', Number(sompi) / 1e8)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the KAS locked in live Kasseal bonding curves on Kaspa L1, read from the curve cells on chain, minus the trade fees accrued in each curve and not yet swept (read from the curve state committed by the cell\'s on-chain script hash). Token-side reserves are not counted. Graduated tokens move to Kasseal pools, which are listed separately.',
  kaspa: { tvl },
}
