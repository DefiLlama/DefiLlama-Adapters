// Polymesh staking TVL adapter (no external deps)
// TVL = total amount of POLYX bonded in staking
// Reads staking storage via JSON RPC:
// 1) Staking.ActiveEra (or Staking.CurrentEra fallback) to get era index
// 2) Staking.ErasTotalStake(eraIndex) to get total stake as Balance (u128 LE)

const RPC = "https://rpc.polymesh.network";
const POLYX_DECIMALS = 1e6;

// ---------- JSON RPC helper ----------
async function rpc(method, params = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  const txt = await res.text();
  let j;
  try {
    j = JSON.parse(txt);
  } catch (e) {
    throw new Error(`RPC returned non JSON: ${txt.slice(0, 200)}`);
  }
  if (j.error) throw new Error(JSON.stringify(j.error));
  return j.result;
}

// ---------- xxhash64 and twox helpers (pure JS, BigInt) ----------
// Substrate storage key prefix is:
// twox128(palletName) + twox128(storageItemName)

const PRIME64_1 = 11400714785074694791n;
const PRIME64_2 = 14029467366897019727n;
const PRIME64_3 = 1609587929392839161n;
const PRIME64_4 = 9650029242287828579n;
const PRIME64_5 = 2870177450012600261n;
const MASK64 = (1n << 64n) - 1n;

function rotl(x, r) {
  return ((x << BigInt(r)) | (x >> BigInt(64 - r))) & MASK64;
}

function readU32LE(buf, i) {
  return (
    BigInt(buf[i]) |
    (BigInt(buf[i + 1]) << 8n) |
    (BigInt(buf[i + 2]) << 16n) |
    (BigInt(buf[i + 3]) << 24n)
  ) & 0xffffffffn;
}

function readU64LE(buf, i) {
  return (
    BigInt(buf[i]) |
    (BigInt(buf[i + 1]) << 8n) |
    (BigInt(buf[i + 2]) << 16n) |
    (BigInt(buf[i + 3]) << 24n) |
    (BigInt(buf[i + 4]) << 32n) |
    (BigInt(buf[i + 5]) << 40n) |
    (BigInt(buf[i + 6]) << 48n) |
    (BigInt(buf[i + 7]) << 56n)
  ) & MASK64;
}

function round(acc, input) {
  acc = (acc + input * PRIME64_2) & MASK64;
  acc = rotl(acc, 31);
  acc = (acc * PRIME64_1) & MASK64;
  return acc;
}

function mergeRound(acc, val) {
  acc ^= round(0n, val);
  acc = (acc * PRIME64_1 + PRIME64_4) & MASK64;
  return acc;
}

function xxhash64(dataBytes, seed) {
  const buf = Buffer.from(dataBytes);
  const len = buf.length;
  let i = 0;
  let h64;

  if (len >= 32) {
    let v1 = (seed + PRIME64_1 + PRIME64_2) & MASK64;
    let v2 = (seed + PRIME64_2) & MASK64;
    let v3 = seed & MASK64;
    let v4 = (seed - PRIME64_1) & MASK64;

    const limit = len - 32;
    while (i <= limit) {
      v1 = round(v1, readU64LE(buf, i)); i += 8;
      v2 = round(v2, readU64LE(buf, i)); i += 8;
      v3 = round(v3, readU64LE(buf, i)); i += 8;
      v4 = round(v4, readU64LE(buf, i)); i += 8;
    }

    h64 = (rotl(v1, 1) + rotl(v2, 7) + rotl(v3, 12) + rotl(v4, 18)) & MASK64;
    h64 = mergeRound(h64, v1);
    h64 = mergeRound(h64, v2);
    h64 = mergeRound(h64, v3);
    h64 = mergeRound(h64, v4);
  } else {
    h64 = (seed + PRIME64_5) & MASK64;
  }

  h64 = (h64 + BigInt(len)) & MASK64;

  while (i + 8 <= len) {
    const k1 = round(0n, readU64LE(buf, i));
    h64 ^= k1;
    h64 = (rotl(h64, 27) * PRIME64_1 + PRIME64_4) & MASK64;
    i += 8;
  }

  if (i + 4 <= len) {
    h64 ^= (readU32LE(buf, i) * PRIME64_1) & MASK64;
    h64 = (rotl(h64, 23) * PRIME64_2 + PRIME64_3) & MASK64;
    i += 4;
  }

  while (i < len) {
    h64 ^= (BigInt(buf[i]) * PRIME64_5) & MASK64;
    h64 = (rotl(h64, 11) * PRIME64_1) & MASK64;
    i++;
  }

  h64 ^= h64 >> 33n;
  h64 = (h64 * PRIME64_2) & MASK64;
  h64 ^= h64 >> 29n;
  h64 = (h64 * PRIME64_3) & MASK64;
  h64 ^= h64 >> 32n;

  return h64 & MASK64;
}

function u64ToLEHex(u64) {
  const b = Buffer.alloc(8);
  let x = u64;
  for (let i = 0; i < 8; i++) {
    b[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  return b.toString("hex");
}

function twox128(str) {
  const bytes = Buffer.from(str, "utf8");
  const h0 = xxhash64(bytes, 0n);
  const h1 = xxhash64(bytes, 1n);
  return u64ToLEHex(h0) + u64ToLEHex(h1);
}

// Storage key for a value:
// twox128(pallet) + twox128(item)
function storageKeyValue(pallet, item) {
  return "0x" + twox128(pallet) + twox128(item);
}

// Storage key for a map where hasher is Twox64Concat on a u32 key:
// prefix + twox64(keyBytes) + keyBytes
function storageKeyMapTwox64ConcatU32(pallet, item, keyU32) {
  const keyBytes = Buffer.alloc(4);
  keyBytes.writeUInt32LE(keyU32, 0);

  const keyHash = xxhash64(keyBytes, 0n); // Twox64 seed 0
  const keyHashHex = u64ToLEHex(keyHash);
  const keyHex = keyBytes.toString("hex");

  return "0x" + twox128(pallet) + twox128(item) + keyHashHex + keyHex;
}

// ---------- SCALE decode helpers ----------
function hexToBuf(hex) {
  if (!hex) return null;
  return Buffer.from(hex.startsWith("0x") ? hex.slice(2) : hex, "hex");
}

// Polymesh Staking.ActiveEra appears to be ActiveEraInfo:
// eraIndex: u32 LE at offset 0
function decodeActiveEraIndex(activeEraHex) {
  const b = hexToBuf(activeEraHex);
  if (!b || b.length < 4) return null;
  return b.readUInt32LE(0);
}

// Balance stored as u128 LE
function decodeU128LE(balanceHex) {
  const b = hexToBuf(balanceHex);
  if (!b || b.length < 16) return 0n;
  let x = 0n;
  for (let i = 0; i < 16; i++) x |= BigInt(b[i]) << (8n * BigInt(i));
  return x;
}

// ---------- TVL ----------
async function tvl() {
  // 1) Read era index
  const activeEraKey = storageKeyValue("Staking", "ActiveEra");
  let activeEraRaw = await rpc("state_getStorage", [activeEraKey]);

  let eraIndex = decodeActiveEraIndex(activeEraRaw);

  // Fallback to CurrentEra if needed
  if (eraIndex === null) {
    const currentEraKey = storageKeyValue("Staking", "CurrentEra");
    const currentEraRaw = await rpc("state_getStorage", [currentEraKey]);
    const b = hexToBuf(currentEraRaw);
    if (b && b.length >= 4) eraIndex = b.readUInt32LE(0);
  }

  if (eraIndex === null) return {};

  // 2) Read ErasTotalStake(eraIndex)
  const totalStakeKey = storageKeyMapTwox64ConcatU32("Staking", "ErasTotalStake", eraIndex);
  const totalStakeRaw = await rpc("state_getStorage", [totalStakeKey]);

  if (!totalStakeRaw) return {};

  const totalStake = decodeU128LE(totalStakeRaw);
  const polyx = Number(totalStake) / POLYX_DECIMALS;

  return { polymesh: polyx };
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts total staked POLYX by reading Staking.ActiveEra (era index) then Staking.ErasTotalStake(era) from Polymesh via JSON RPC.",
  polymesh: { tvl },
};
