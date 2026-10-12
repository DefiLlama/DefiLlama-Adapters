const tls = require('tls')
const crypto = require('crypto')
const sdk = require('@defillama/sdk')

// Public BCH Electrum (Fulcrum) servers, SSL port. imaginary/blackie/niblerino/
// stackwallet all served live balance reads on 2026-10-11; node.bch.ninja was
// dropped (DNS-dead). Tried in order; a dead server falls through to the next,
// total failure throws (fail-loud: a silent $0 would be worse than no update).
const SERVERS = [
  'electrum.imaginary.cash',
  'blackie.c3-soft.com',
  'niblerino.com',
  'bitcoincash.stackwallet.com',
]
const PORT = 50002

// 1MB: a 36-line batch is ~2KB; anything larger is a pathological peer
const MAX_BUF = 1 << 20

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
function base58Decode(s) {
  let n = 0n
  for (const c of s) {
    const digit = ALPHABET.indexOf(c)
    if (digit < 0) throw new Error(`bitcoincash: invalid base58 char in address ${s}`)
    n = n * 58n + BigInt(digit)
  }
  let hex = n.toString(16)
  if (hex.length % 2) hex = '0' + hex
  const bytes = Buffer.from(hex, 'hex')
  const pad = Buffer.alloc(Math.max(0, 25 - bytes.length))
  const raw = Buffer.concat([pad, bytes])
  // canonicality: each leading '1' encodes one leading zero byte; a dropped
  // or added '1' must not alias to the same address
  let leadingOnes = 0
  for (const c of s) { if (c === '1') leadingOnes++; else break }
  let leadingZeros = 0
  for (const b of raw) { if (b === 0) leadingZeros++; else break }
  if (leadingOnes !== leadingZeros) throw new Error(`bitcoincash: non-canonical address ${s}`)
  return raw
}

// strict base58check: 25 bytes, valid checksum, P2PKH (0) or P2SH (5) only.
// Anything else (incl. cashaddr, which contains ':') throws instead of
// resolving a wrong script.
function decodeAddress(addr) {
  const raw = base58Decode(addr)
  if (raw.length !== 25) throw new Error(`bitcoincash: bad address length for ${addr}`)
  const payload = raw.slice(0, 21)
  const check = crypto.createHash('sha256').update(crypto.createHash('sha256').update(payload).digest()).digest().slice(0, 4)
  if (!check.equals(raw.slice(21))) throw new Error(`bitcoincash: checksum failed for ${addr}`)
  const ver = raw[0]
  if (ver !== 0 && ver !== 5) throw new Error(`bitcoincash: unsupported version byte ${ver} for ${addr}`)
  return { ver, hash: raw.slice(1, 21) }
}

// legacy address -> electrum scripthash (reversed sha256 of scriptPubKey)
function addressToScripthash(addr) {
  const { ver, hash } = decodeAddress(addr)
  const script = ver === 5
    ? Buffer.concat([Buffer.from([0xa9, 0x14]), hash, Buffer.from([0x87])])
    : Buffer.concat([Buffer.from([0x76, 0xa9, 0x14]), hash, Buffer.from([0x88, 0xac])])
  return crypto.createHash('sha256').update(script).digest().reverse().toString('hex')
}

function queryServer(host, scripthashes) {
  return new Promise((resolve, reject) => {
    // single 20s inactivity deadline per host (connect + response); expiry
    // fails over to the next server, total failure throws
    const socket = tls.connect({ host, port: PORT }, () => {
      const batch = scripthashes.map((sh, i) =>
        JSON.stringify({ id: i, method: 'blockchain.scripthash.get_balance', params: [sh] }) + '\n'
      ).join('')
      socket.write(batch)
    })
    let buf = ''
    let finished = false
    const done = (err, result) => {
      if (finished) return
      finished = true
      socket.destroy()
      err ? reject(err) : resolve(result)
    }
    socket.setTimeout(20000, () => done(new Error(`bitcoincash: timeout from ${host}`)))
    socket.on('error', (e) => done(new Error(`bitcoincash: ${host}: ${e.message}`)))
    // clean EOF mid-batch fails over now instead of waiting out the timeout
    socket.on('close', () => { if (!finished) done(new Error(`bitcoincash: ${host}: connection closed mid-batch`)) })
    socket.on('data', (chunk) => {
      buf += chunk.toString()
      if (buf.length > MAX_BUF) return done(new Error(`bitcoincash: ${host}: response too large`))
      // TCP chunks need not end on message boundaries: only newline-terminated
      // lines are complete responses; the trailing fragment stays buffered
      const parts = buf.split('\n')
      const lines = parts.slice(0, -1).filter(Boolean)
      if (lines.length < scripthashes.length) return
      try {
        // attribute by id: servers may answer out of order
        const byId = {}
        for (const line of lines) {
          const response = JSON.parse(line)
          if (response.error) throw new Error(`bitcoincash: ${host}: ${response.error.message || JSON.stringify(response.error)}`)
          const res = response.result
          // confirmed must be a valid reserve amount (explicit zero is fine).
          // unconfirmed may legitimately go negative (mempool spends) — it is
          // type-checked only and never added to the total.
          const validAmount = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && Number.isInteger(v)
          if (!res || !validAmount(res.confirmed) || typeof res.unconfirmed !== 'number' || !Number.isFinite(res.unconfirmed))
            throw new Error(`bitcoincash: ${host}: malformed result for request ${response.id}`)
          // exactly one response per requested id: duplicates/unknown ids
          // would otherwise publish a wrong nonzero total instead of failing
          if (!Number.isInteger(response.id) || response.id < 0 || response.id >= scripthashes.length || byId[response.id] !== undefined)
            throw new Error(`bitcoincash: ${host}: unexpected response id ${response.id}`)
          byId[response.id] = res
        }
        let total = 0
        for (let i = 0; i < scripthashes.length; i++) {
          const res = byId[i]
          if (!res) throw new Error(`bitcoincash: ${host}: missing response for request ${i}`)
          total += res.confirmed // confirmed only: unconfirmed mempool is not reserves
        }
        done(null, total / 1e8)
      } catch (e) { done(e) }
    })
  })
}

async function sumTokens({ balances = {}, owners = [] }) {
  if (!owners.length) throw new Error('bitcoincash: empty owner set (refusing to publish $0)')
  const scripthashes = owners.map(addressToScripthash)
  let lastError
  for (const host of SERVERS) {
    try {
      const total = await queryServer(host, scripthashes)
      // coingecko:bitcoin-cash: the chain slug 'bitcoincash' is not a CoinGecko
      // id, so price it explicitly (same pattern as chain/bsv.js)
      sdk.util.sumSingleBalance(balances, 'coingecko:bitcoin-cash', total)
      return balances
    } catch (e) { lastError = e }
  }
  throw lastError
}

module.exports = { sumTokens }
