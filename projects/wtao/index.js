const {
  rpc, getFinalizedHead, getStorage, getFreeBalance,
  subtensorPrefix, hexToBuf, keyHex, blake128, u16le, u64LE, u128LE,
} = require('../helper/chain/bittensor')

// Bittensor custody coldkey behind wTAO (32-byte pubkey of 5HiveMEoW...).
const CUSTODY = 'fa538a1f58eb874d88632a329bc3e6423be5f7da88c1133e4b4d5ed1f3f1ce05'

const b2c = (buf) => Buffer.concat([blake128(buf), buf]) // Blake2_128Concat
/** Read a little-endian signed i64 from buffer b at offset o. */
const i64LE = (b, o = 0) => { let v = u64LE(b, o); if (v & (1n << 63n)) v -= (1n << 64n); return v }
// V2 SafeDecimal {mantissa:u128, exponent:i64}: real = m * 2^e
const fpV2 = (b) => (!b || b.length < 24) ? 0 : Number(u128LE(b, 0)) * Math.pow(2, Number(i64LE(b, 16)))
// V1 U64F64 {bits:u128}: real = bits / 2^64
const fpV1 = (b) => (!b || b.length < 16) ? 0 : Number(u128LE(b, 0)) / Math.pow(2, 64)

/** Batch-read many storage keys at one block; returns Map<keyHex, valueHex|null>. */
async function getMany(keyBufs, at) {
  if (!keyBufs.length) return new Map()
  const keys = keyBufs.map(keyHex)
  const res = await rpc('state_queryStorageAt', [keys, at])
  const out = new Map(keys.map((k) => [k, null]))
  for (const cs of res) for (const [k, v] of cs.changes) out.set(k, v)
  return out
}

/** Enumerate the netuids present under a storage prefix at one block. */
async function netuidsUnder(pfx, at) {
  const out = []; let start = keyHex(pfx)
  for (;;) {
    const keys = await rpc('state_getKeysPaged', [keyHex(pfx), 200, start, at])
    if (!keys.length) break
    for (const kh of keys) { const t = hexToBuf(kh).subarray(pfx.length); out.push(t[0] | (t[1] << 8)) }
    if (keys.length < 200) break
    start = keys[keys.length - 1]
  }
  return out
}

/** TVL = TAO locked on Bittensor backing wTAO: the custody coldkey's free
 * balance plus its total staked TAO. All reads are pinned to one finalized
 * block so the multi-step stake walk is a consistent snapshot. */
async function tvl(api) {
  const cold = hexToBuf(CUSTODY)
  // Pin every read to one finalized block (state advances between calls otherwise).
  const at = await getFinalizedHead()

  // Free balance (System.Account, AccountData.free).
  const free = await getFreeBalance(cold, at)

  // Hotkeys this coldkey stakes to: StakingHotkeys(cold) -> Vec<AccountId32>.
  const shRaw = await getStorage(Buffer.concat([subtensorPrefix('StakingHotkeys'), b2c(cold)]), at)
  const hotkeys = []
  if (shRaw) {
    const b = hexToBuf(shRaw), mode = b[0] & 3
    let count, off
    if (mode === 0) { count = b[0] >> 2; off = 1 }
    else if (mode === 1) { count = (b[0] | (b[1] << 8)) >> 2; off = 2 }
    else if (mode === 2) { count = (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 2; off = 4 }
    else throw new Error('unexpected compact vec length')
    for (let i = 0; i < count; i++) { hotkeys.push(Buffer.from(b.subarray(off, off + 32))); off += 32 }
  }

  // Discover which (hotkey, netuid) carry stake, in the V2 and legacy V1 stores.
  const aV2 = (hot) => Buffer.concat([subtensorPrefix('AlphaV2'), b2c(hot), b2c(cold)])
  const aV1 = (hot) => Buffer.concat([subtensorPrefix('Alpha'), b2c(hot), b2c(cold)])
  const entries = []
  for (const hot of hotkeys) {
    for (const n of await netuidsUnder(aV2(hot), at)) entries.push({ hot, net: n, v: 2 })
    for (const n of await netuidsUnder(aV1(hot), at)) entries.push({ hot, net: n, v: 1 })
  }

  // One batched read of every share/total/pool value needed.
  const reads = []
  for (const e of entries) {
    reads.push(e.v === 2 ? Buffer.concat([aV2(e.hot), u16le(e.net)]) : Buffer.concat([aV1(e.hot), u16le(e.net)]))
    reads.push(Buffer.concat([subtensorPrefix(e.v === 2 ? 'TotalHotkeySharesV2' : 'TotalHotkeyShares'), b2c(e.hot), u16le(e.net)]))
    reads.push(Buffer.concat([subtensorPrefix('TotalHotkeyAlpha'), b2c(e.hot), u16le(e.net)]))
  }
  const vals = await getMany(reads, at)
  const V = (buf) => vals.get(keyHex(buf))

  for (const e of entries) {
    let alpha
    if (e.v === 2) {
      const share = fpV2(hexToBuf(V(Buffer.concat([aV2(e.hot), u16le(e.net)])) || '0x'))
      if (!share) continue
      const totShares = fpV2(hexToBuf(V(Buffer.concat([subtensorPrefix('TotalHotkeySharesV2'), b2c(e.hot), u16le(e.net)])) || '0x'))
      const taRaw = V(Buffer.concat([subtensorPrefix('TotalHotkeyAlpha'), b2c(e.hot), u16le(e.net)]))
      const totAlpha = taRaw ? Number(u64LE(hexToBuf(taRaw))) : 0
      alpha = totShares > 0 ? (share / totShares) * totAlpha : 0
    } else {
      alpha = fpV1(hexToBuf(V(Buffer.concat([aV1(e.hot), u16le(e.net)])) || '0x'))
      if (!alpha) continue
    }
    api.add(e.net.toString(), alpha)
  }

  api.addCGToken('bittensor', free)
}

module.exports = {
  timetravel: false,
  methodology: 'TAO locked on Bittensor backing wTAO on Ethereum. The bridge custody coldkey (5HiveMEoWPmQmBAb8v63bKPcFhgTGCmST1TVZNvPHSTKFLCv) holds the collateral and stakes most of it, so TVL is its free balance plus its total staked TAO, read keyless from public substrate RPC (dTAO share pools, alpha priced using subnet AMM).',
  bittensor: { tvl },
}
