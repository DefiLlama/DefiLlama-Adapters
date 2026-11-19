const sdk = require('@defillama/sdk')

const { substrate } = sdk.chains
const CHAIN = 'bittensor' // BITTENSOR_RPC (helper/env.js) / BITTENSOR_SUBSTRATE_RPC, comma separated fallbacks

// Storage map prefixes (twox128(pallet) ++ twox128(item)).
const hexToBuf = (h) => Buffer.from(h.replace(/^0x/, ''), 'hex')
const keyHex = (buf) => '0x' + Buffer.from(buf).toString('hex')
const blake128 = (buf) => substrate.blake2_128(buf)
const u16le = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]) // Identity(u16 netuid)
const pubkey = (address) => substrate.ss58Decode(address) // SS58 -> 32-byte account pubkey
const subtensorPrefix = (item) => substrate.storagePrefix('SubtensorModule', item)

const u64LE = (b, o = 0) => substrate.decodeUint(b, { offset: o, bytes: 8 })
const u128LE = (b, o = 0) => substrate.decodeUint(b, { offset: o, bytes: 16 })

async function rpc(method, params) {
  return substrate.rpc({ chain: CHAIN, method, params })
}

const getFinalizedHead = () => substrate.getFinalizedHead({ chain: CHAIN })
const getStorage = (key, at) => substrate.getStorageRaw({ chain: CHAIN, key, at })

// Free TAO balance of a 32-byte account pubkey (excludes staked TAO). TAO balances are u64.
async function getFreeBalance(pubkeyBuf, at) {
  const { free } = await substrate.getSystemAccount({ chain: CHAIN, address: pubkeyBuf, at, balanceBytes: 8 })
  return Number(free) / 1e9
}

const getBalance = (address, at) => getFreeBalance(pubkey(address), at)

async function sumTokens({ balances = {}, owners = [] }) {
  const at = await getFinalizedHead()
  let total = 0
  for (const owner of owners) {
    total += await getBalance(owner, at)
  }
  sdk.util.sumSingleBalance(balances, 'bittensor', total)
  return balances
}

module.exports = {
  sumTokens,
  rpc,
  getFinalizedHead,
  getStorage,
  getFreeBalance,
  getBalance,
  subtensorPrefix,
  hexToBuf,
  keyHex,
  blake128,
  u16le,
  u64LE,
  u128LE,
}
