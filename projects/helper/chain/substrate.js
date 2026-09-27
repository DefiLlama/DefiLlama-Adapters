// Minimal Substrate storage reader over plain HTTP JSON-RPC (no @polkadot/api).
// Good for plain storage items and (double) maps whose values are made of fixed-width
// integers, options and compacts. Anything that needs chain metadata to decode
// arbitrary nested types should be decoded by hand in the adapter using the SCALE helpers below.
//
// Transport, hashing (xxhash / blake2 / ss58), SCALE codec and storage key derivation live in
// @defillama/sdk (`sdk.chains.substrate`); this file keeps the positional `(chain, ...)` signatures
// and the BigInt result shapes the adapters were written against.
//
// Endpoints: `<CHAIN>_SUBSTRATE_RPC`, then the sdk defaults, then `<CHAIN>_RPC` (as configured in
// helper/env.js, e.g. ASTAR_SUBSTRATE_RPC, BIFROST_POLKADOT_RPC), comma separated for fallbacks.
// A full URL can also be passed directly instead of a chain name.
require('../env') // seeds the <CHAIN>_RPC defaults into process.env for the sdk
const { substrate } = require('@defillama/sdk').chains

async function rpc(chain, method, params = []) {
  return substrate.rpc({ chain, method, params })
}

// ---------- hashing / addresses ----------

const {
  xxhash64, twox64, twox128, blake2_128, blake2_256, ss58Decode, storageKey, storagePrefix, stripHasher,
  decodeUint, decodeCompact, encodeU8, encodeU16, encodeU32, encodeU64, encodeU128, encodeCompact,
  ScaleReader, toBuf, hex,
} = substrate

// ---------- storage ----------

// plain item or a single map entry -> raw hex value (or null)
async function getStorage(chain, { pallet, item, key, hasher, keys, at }) {
  return substrate.getStorage({ chain, pallet, item, key, hasher, keys, at })
}

async function getStorageBatch(chain, storageKeys, { at } = {}) {
  return substrate.getStorageBatch({ chain, storageKeys, at })
}

// every entry of a map (optionally under a partial key for double maps) -> [{ key, value, rest }]
// `rest` is the key buffer after the pallet/item prefix and the given partial keys
async function getStorageEntries(chain, { pallet, item, keys = [], pageSize = 1000, at }) {
  return substrate.getStorageEntries({ chain, pallet, item, keys, pageSize, at })
}

// runtime api call, e.g. stateCall(chain, 'CurrenciesApi_account', encodedArgs)
async function stateCall(chain, method, data, { at } = {}) {
  return substrate.stateCall({ chain, method, data, at })
}

// ---------- common pallets ----------

// frame_system AccountInfo -> { free, reserved, frozen } as BigInt
// balances are u128 on most chains; pass balanceBytes: 8 for chains with u64 balances (e.g. bittensor)
function decodeAccountInfo(value, { balanceBytes = 16 } = {}) {
  const { free, reserved, frozen } = substrate.decodeAccountInfo(value, { balanceBytes })
  return { free: BigInt(free), reserved: BigInt(reserved), frozen: BigInt(frozen) }
}

async function getSystemAccount(chain, address, { at, balanceBytes = 16 } = {}) {
  const { free, reserved, frozen } = await substrate.getSystemAccount({ chain, address, at, balanceBytes })
  return { free: BigInt(free), reserved: BigInt(reserved), frozen: BigInt(frozen) }
}

// orml_tokens AccountData -> { free, reserved, frozen } as BigInt
function decodeOrmlAccountData(value) {
  const { free, reserved, frozen } = substrate.decodeOrmlAccountData(value)
  return { free: BigInt(free), reserved: BigInt(reserved), frozen: BigInt(frozen) }
}

// orml Tokens.Accounts(AccountId: Blake2_128Concat, CurrencyId: Twox64Concat)
async function getTokensAccount(chain, address, currencyId, { at } = {}) {
  const { free, reserved, frozen } = await substrate.getTokensAccount({ chain, address, currencyId, at })
  return { free: BigInt(free), reserved: BigInt(reserved), frozen: BigInt(frozen) }
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
