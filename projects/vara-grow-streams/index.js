const blake = require('blakejs')
const { post } = require('../helper/http')

const VARA_RPC = 'https://rpc.vara.network'
const VARA_DECIMALS = 1e12

const TOKEN_VAULT_V2 = '0x20099b7637ae936670f54464c4109d1f028fbb63230e151ea4ef29c4a94cbcef'
// vault set as token_vault in StreamCore 0x8298…0659 GetConfig
const TOKEN_VAULT_V3 = '0x657cf9c4f929aeac97092037826c1117f9e6cd0e3c4edc44e49decc17b840aa9'
const WVARA = '0xf5e9cb1d1e46b0cda6578dd1684b30f281a45dfaa390e4945b7bfc8ab3e27f3d'
const GVARA = '0x04314af41b7dbac322e3e66920211d2f799719e1cdc3122a99752f72b6ae84ee'

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
  const balances = await getSpendableNative([TOKEN_VAULT_V2, TOKEN_VAULT_V3, WVARA, GVARA], at)
  const total = balances.reduce((acc, b) => acc + b, 0n)

  api.addCGToken('vara-network', Number(total) / VARA_DECIMALS)
}

module.exports = {
  methodology: 'GrowStreams deploys and owns the V2 and V3 token vaults and its wVARA and gVARA wrapper programs. TVL is the combined spendable native VARA held by all four: the vault balances plus the native VARA backing wVARA and gVARA tokens.',
  vara: { tvl },
}
