const blake = require('blakejs')
const { post } = require('../helper/http')

const VARA_RPC = 'https://rpc.vara.network'
const VARA_DECIMALS = 1e12

// GrowStreams V2 + V3 Sails smart contracts on Vara Mainnet
const PROTOCOL_CONTRACTS = [
  '0x20099b7637ae936670f54464c4109d1f028fbb63230e151ea4ef29c4a94cbcef', // TokenVault V2
  '0x657cf9c4f929aeac97092037826c1117f9e6cd0e3c4edc44e49decc17b840aa9', // TokenVault V3 (Native + VFT Escrow)
  '0xf5e9cb1d1e46b0cda6578dd1684b30f281a45dfaa390e4945b7bfc8ab3e27f3d', // wVARA Wrapper
  '0x04314af41b7dbac322e3e66920211d2f799719e1cdc3122a99752f72b6ae84ee', // gVARA SuperToken V3 (Buffered Flow)
  '0x71de1ef1f4dec1a4fe862aa6c92747c8499bbf1af128625749027392709f4a72', // gVARA SuperToken V2
  '0x8298c2eea5c6bbe55a9cfe72283b5399098fd6a54d9a2a14c2bedba8eea50659', // StreamCore V3
  '0x68b9fd8f53f6557db2c26b5b9a7c63061bb7f36d379dc843b8a53e78f5692f45', // SplitsRouter (60/15/15/10 Agent Society Splits)
  '0x7697bb2e8655e6cd7294389a0289355f48fd5459914d2a735c9966dad548bd4f', // BountyAdapter (AI-Verified Streaming Bounties)
  '0x52f4299e964dab5e97c91cdd10e2d6e635b19696ab8389889aabceba3de9e581', // PermissionManager (Autonomous Agent Delegations)
  '0x7aaa5fa39237ad7f63a78d5acd8a0ff080bd034b8e78de5d4756d6fe4fb25b70', // DistributionPool
  '0x411c62d126b3131ace5e94b618b8cbbdbffb5b9cfdd656f2f6da0786f60cb2c3', // LiquidationManager
  '0x4a9718de4055470963104a4c08e5154ad0c2c48a699996b59e861de9393bf347', // gGROW SuperToken
  '0x728d04df91561c66938053a4f5178f749da004ebd219ca05f7c090609a6f7163', // GROW Token
]

// twox128("System") ++ twox128("Account")
const SYSTEM_ACCOUNT_PREFIX = '26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9'

function u128LE(bytes, offset = 0) {
  let value = 0n
  for (let i = 15; i >= 0; i--) value = (value << 8n) | BigInt(bytes[offset + i])
  return value
}

function accountStorageKey(address) {
  const account = Buffer.from(address.slice(2), 'hex')
  const hash = Buffer.from(blake.blake2b(account, undefined, 16))
  return `0x${SYSTEM_ACCOUNT_PREFIX}${hash.toString('hex')}${account.toString('hex')}`
}

async function rpc(method, params) {
  const response = await post(VARA_RPC, { jsonrpc: '2.0', id: 1, method, params })
  if (response.error) throw new Error(`vara-grow-streams: ${method} failed: ${JSON.stringify(response.error)}`)
  return response.result
}

async function getSpendableNative(addresses, at) {
  const blockHash = at ?? await rpc('chain_getFinalizedHead', [])
  const keys = addresses.map(accountStorageKey)
  const result = await rpc('state_queryStorageAt', [keys, blockHash])
  const values = new Map(keys.map(key => [key, null]))

  for (const changeSet of result || [])
    for (const [key, value] of changeSet.changes || []) values.set(key, value)

  return keys.map(key => {
    const raw = values.get(key)
    if (!raw) return 0n
    const bytes = Buffer.from(raw.slice(2), 'hex')
    if (bytes.length < 64) throw new Error(`vara-grow-streams: malformed System.Account response for ${key}`)

    // AccountInfo contains four u32 fields, followed by AccountData. `free` and
    // `frozen` are the first and third u128 values in AccountData respectively.
    const free = u128LE(bytes, 16)
    const frozen = u128LE(bytes, 48)
    return free > frozen ? free - frozen : 0n
  })
}

async function tvl(api) {
  const at = await rpc('chain_getFinalizedHead', [])
  const balances = await getSpendableNative(PROTOCOL_CONTRACTS, at)
  const total = balances.reduce((acc, b) => acc + b, 0n)

  api.addCGToken('vara-network', Number(total) / VARA_DECIMALS)
}

module.exports = {
  methodology:
    'GrowStreams deploys and owns the V2/V3 TokenVaults, wVARA and gVARA wrapper programs, StreamCore, SplitsRouter, BountyAdapter, PermissionManager, DistributionPool, and LiquidationManager on Vara Network. TVL is the combined spendable native VARA held across these protocol contracts backing active streams, bounties, agent splits, and wrapped tokens.',
  vara: { tvl },
}
