const sdk = require('@defillama/sdk')
const bs58 = require('bs58').default
const blake = require('blakejs')
const { post } = require('../http')

const RPC = 'https://entrypoint-finney.opentensor.ai'
const RPC_TIMEOUT_MS = 30_000

// Storage map prefixes (twox128(pallet) ++ twox128(item)).
const SYS_ACCOUNT = '26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9' // System.Account
const SUBTENSOR_PALLET = '658faa385070e074c85bf6b568cf0555' // twox128("SubtensorModule")
// twox128(item) for SubtensorModule storage items
const SUBTENSOR_ITEMS = {
  SubnetTAO: '7a57dce016211512d1700561066b85a3',
  SubnetAlphaIn: '2ce12f7007574647d692ac7edf8b7a53',
  StakingHotkeys: 'b7d32a0408ab25b30dac6ec2cb66fe1f',
  Alpha: '7261f9a8fde18018cccf70368697902f',
  AlphaV2: '421d8174603a6a6036511a7619b402f0',
  TotalHotkeyShares: '3dbb78074d07a16f4942c7df159ed5e5',
  TotalHotkeySharesV2: 'e47c637aa82c21537eb9caa511e543c5',
  TotalHotkeyAlpha: 'ee25c3b5b1886863480497907f1829e6',
}

const hexToBuf = (h) => Buffer.from(h.replace(/^0x/, ''), 'hex')
const keyHex = (buf) => '0x' + Buffer.from(buf).toString('hex')
const blake128 = (buf) => Buffer.from(blake.blake2b(buf, undefined, 16))
const u16le = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]) // Identity(u16 netuid)
const pubkey = (address) => Buffer.from(bs58.decode(address).slice(1, 33)) // SS58 -> 32-byte account pubkey
const subtensorPrefix = (item) => Buffer.concat([hexToBuf(SUBTENSOR_PALLET), hexToBuf(SUBTENSOR_ITEMS[item])])

const u64LE = (b, o = 0) => { let v = 0n; for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[o + i]); return v }
const u128LE = (b, o = 0) => { let v = 0n; for (let i = 15; i >= 0; i--) v = (v << 8n) | BigInt(b[o + i]); return v }

async function rpc(method, params) {
  const res = await post(RPC, { jsonrpc: '2.0', id: 1, method, params }, { timeout: RPC_TIMEOUT_MS })
  if (res.error) throw new Error(`${method} RPC error: ${JSON.stringify(res.error)}`)
  return res.result
}

const getFinalizedHead = () => rpc('chain_getFinalizedHead', [])
const getStorage = (key, at) => rpc('state_getStorage', [keyHex(key), at])

// Free TAO balance of a 32-byte account pubkey (excludes staked TAO)
async function getFreeBalance(pubkeyBuf, at) {
  // System.Account uses the Blake2_128Concat hasher: prefix ++ blake2_128(pubkey) ++ pubkey.
  const raw = await getStorage(Buffer.concat([hexToBuf(SYS_ACCOUNT), blake128(pubkeyBuf), pubkeyBuf]), at)
  // AccountInfo: 4 x u32 (nonce, consumers, providers, sufficients) then AccountData.free (u128 LE) at offset 16.
  return raw ? Number(u128LE(hexToBuf(raw), 16)) / 1e9 : 0
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
