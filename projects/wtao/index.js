const blake = require('blakejs');
const { post } = require('../helper/http');

const RPC = 'https://entrypoint-finney.opentensor.ai';
// Bittensor custody coldkey behind wTAO (32-byte pubkey of 5HiveMEoW...).
const CUSTODY = 'fa538a1f58eb874d88632a329bc3e6423be5f7da88c1133e4b4d5ed1f3f1ce05';

// twox128("SubtensorModule") ++ twox128(item), precomputed.
const PALLET = '658faa385070e074c85bf6b568cf0555';
const ITEM = {
  StakingHotkeys: 'b7d32a0408ab25b30dac6ec2cb66fe1f',
  Alpha: '7261f9a8fde18018cccf70368697902f',
  AlphaV2: '421d8174603a6a6036511a7619b402f0',
  TotalHotkeyShares: '3dbb78074d07a16f4942c7df159ed5e5',
  TotalHotkeySharesV2: 'e47c637aa82c21537eb9caa511e543c5',
  TotalHotkeyAlpha: 'ee25c3b5b1886863480497907f1829e6',
};
const SYS_ACCOUNT = '26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9';

const hexToBuf = (h) => Buffer.from(h.replace(/^0x/, ''), 'hex');
const blake128 = (buf) => Buffer.from(blake.blake2b(buf, undefined, 16));
const b2c = (buf) => Buffer.concat([blake128(buf), buf]); // Blake2_128Concat
const u16le = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]); // Identity(u16 netuid)
const prefix = (item) => Buffer.concat([hexToBuf(PALLET), hexToBuf(ITEM[item])]);
const keyHex = (buf) => '0x' + buf.toString('hex');

/** Read a little-endian u128 from buffer b at offset o. */
function u128LE(b, o) { let v = 0n; for (let i = 15; i >= 0; i--) v = (v << 8n) | BigInt(b[o + i]); return v; }
/** Read a little-endian u64 from buffer b at offset o. */
function u64LE(b, o) { let v = 0n; for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[o + i]); return v; }
/** Read a little-endian signed i64 from buffer b at offset o. */
function i64LE(b, o) { let v = u64LE(b, o); if (v & (1n << 63n)) v -= (1n << 64n); return v; }
// V2 SafeDecimal {mantissa:u128, exponent:i64}: real = m * 2^e
const fpV2 = (b) => (!b || b.length < 24) ? 0 : Number(u128LE(b, 0)) * Math.pow(2, Number(i64LE(b, 16)));
// V1 U64F64 {bits:u128}: real = bits / 2^64
const fpV1 = (b) => (!b || b.length < 16) ? 0 : Number(u128LE(b, 0)) / Math.pow(2, 64);

/** One substrate JSON-RPC call; throws on an error body. */
async function rpc(method, params) {
  const res = await post(RPC, { jsonrpc: '2.0', id: 1, method, params }, { timeout: 30000 });
  if (res.error) throw new Error(`${method}: ${JSON.stringify(res.error)}`);
  return res.result;
}
/** Batch-read many storage keys at one block; returns Map<keyHex, valueHex|null>. */
async function getMany(keyBufs, at) {
  if (!keyBufs.length) return new Map();
  const keys = keyBufs.map(keyHex);
  const res = await rpc('state_queryStorageAt', [keys, at]);
  const out = new Map(keys.map((k) => [k, null]));
  for (const cs of res) for (const [k, v] of cs.changes) out.set(k, v);
  return out;
}
/** Enumerate the netuids present under a storage prefix at one block. */
async function netuidsUnder(pfx, at) {
  const out = []; let start = keyHex(pfx);
  for (;;) {
    const keys = await rpc('state_getKeysPaged', [keyHex(pfx), 200, start, at]);
    if (!keys.length) break;
    for (const kh of keys) { const t = hexToBuf(kh).subarray(pfx.length); out.push(t[0] | (t[1] << 8)); }
    if (keys.length < 200) break;
    start = keys[keys.length - 1];
  }
  return out;
} 

/** TVL = TAO locked on Bittensor backing wTAO: the custody coldkey's free
 * balance plus its total staked TAO. All reads are pinned to one finalized
 * block so the multi-step stake walk is a consistent snapshot. */
async function tvl(api) {
  const cold = hexToBuf(CUSTODY);
  // Pin every read to one finalized block (state advances between calls otherwise).
  const at = await rpc('chain_getFinalizedHead', []);

  // Free balance: System.Account, free = u128 LE at byte offset 16.
  const accKey = keyHex(Buffer.concat([hexToBuf(SYS_ACCOUNT), blake128(cold), cold]));
  const accRaw = await rpc('state_getStorage', [accKey, at]);
  const free = accRaw ? Number(u128LE(hexToBuf(accRaw), 16)) / 1e9 : 0;

  // Hotkeys this coldkey stakes to: StakingHotkeys(cold) -> Vec<AccountId32>.
  const shKey = keyHex(Buffer.concat([prefix('StakingHotkeys'), b2c(cold)]));
  const shRaw = await rpc('state_getStorage', [shKey, at]);
  const hotkeys = [];
  if (shRaw) {
    const b = hexToBuf(shRaw), mode = b[0] & 3;
    let count, off;
    if (mode === 0) { count = b[0] >> 2; off = 1; }
    else if (mode === 1) { count = (b[0] | (b[1] << 8)) >> 2; off = 2; }
    else if (mode === 2) { count = (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 2; off = 4; }
    else throw new Error('unexpected compact vec length');
    for (let i = 0; i < count; i++) { hotkeys.push(Buffer.from(b.subarray(off, off + 32))); off += 32; }
  }

  // Discover which (hotkey, netuid) carry stake, in the V2 and legacy V1 stores.
  const aV2 = (hot) => Buffer.concat([prefix('AlphaV2'), b2c(hot), b2c(cold)]);
  const aV1 = (hot) => Buffer.concat([prefix('Alpha'), b2c(hot), b2c(cold)]);
  const entries = [];
  for (const hot of hotkeys) {
    for (const n of await netuidsUnder(aV2(hot), at)) entries.push({ hot, net: n, v: 2 });
    for (const n of await netuidsUnder(aV1(hot), at)) entries.push({ hot, net: n, v: 1 });
  }

  // One batched read of every share/total/pool value needed.
  const reads = [];
  for (const e of entries) {
    reads.push(e.v === 2 ? Buffer.concat([aV2(e.hot), u16le(e.net)]) : Buffer.concat([aV1(e.hot), u16le(e.net)]));
    reads.push(Buffer.concat([prefix(e.v === 2 ? 'TotalHotkeySharesV2' : 'TotalHotkeyShares'), b2c(e.hot), u16le(e.net)]));
    reads.push(Buffer.concat([prefix('TotalHotkeyAlpha'), b2c(e.hot), u16le(e.net)]));
  }
  const vals = await getMany(reads, at);
  const V = (buf) => vals.get(keyHex(buf));

  for (const e of entries) {
    let alpha;
    if (e.v === 2) {
      const shareB = hexToBuf(V(Buffer.concat([aV2(e.hot), u16le(e.net)])) || '0x');
      const share = fpV2(shareB);
      if (!share) continue;
      const totShares = fpV2(hexToBuf(V(Buffer.concat([prefix('TotalHotkeySharesV2'), b2c(e.hot), u16le(e.net)])) || '0x'));
      const taRaw = V(Buffer.concat([prefix('TotalHotkeyAlpha'), b2c(e.hot), u16le(e.net)]));
      const totAlpha = taRaw ? Number(u64LE(hexToBuf(taRaw), 0)) : 0;
      alpha = totShares > 0 ? (share / totShares) * totAlpha : 0;
    } else {
      alpha = fpV1(hexToBuf(V(Buffer.concat([aV1(e.hot), u16le(e.net)])) || '0x'));
      if (!alpha) continue;
    }
    api.add(e.net.toString(), alpha)
  }

  api.addCGToken('bittensor', free);
}

module.exports = {
  timetravel: false,
  methodology: 'TAO locked on Bittensor backing wTAO on Ethereum. The bridge custody coldkey (5HiveMEoWPmQmBAb8v63bKPcFhgTGCmST1TVZNvPHSTKFLCv) holds the collateral and stakes most of it, so TVL is its free balance plus its total staked TAO, read keyless from public substrate RPC (dTAO share pools, alpha priced using subnet AMM).',
  bittensor: { tvl }, 
};
