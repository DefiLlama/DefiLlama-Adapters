const axios = require('axios')
const { hash } = require('starknet')

const CONFIGURED_STARKNET_RPC = process.env.STARKNET_RPC
const STARKNET_RPC = !CONFIGURED_STARKNET_RPC || CONFIGURED_STARKNET_RPC.includes('rpc.starknet.lava.build')
  ? 'https://api.cartridge.gg/x/starknet/mainnet'
  : CONFIGURED_STARKNET_RPC
const REGISTRY = '0x37ad81bcfa789e849216f5ea973c6ac22b5c9cdb05c29e9d5667252440d8300'
const REGISTRY_DEPLOYMENT_BLOCK = 10474202
const PRICE_CHAIN_BY_LZ_EID = { 30101: 'ethereum' }

const VTOKEN_ADDED = hash.getSelectorFromName('VTokenAdded')
const OMNICHAIN_VTOKEN_ADDED = hash.getSelectorFromName('OmnichainVTokenAdded')

let requestId = 0
const timestampBlockPromises = new Map()

async function rpc(method, params) {
  const { data } = await axios.post(STARKNET_RPC, {
    jsonrpc: '2.0',
    id: ++requestId,
    method,
    params,
  })

  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function getBlockTimestamp(blockNumber) {
  const block = await rpc('starknet_getBlockWithTxHashes', [{ block_number: blockNumber }])
  return block.timestamp
}

async function findBlockAtOrBefore(timestamp) {
  let low = REGISTRY_DEPLOYMENT_BLOCK
  let high = await rpc('starknet_blockNumber', [])

  if (timestamp < await getBlockTimestamp(low)) return null
  if (timestamp >= await getBlockTimestamp(high)) return high

  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (await getBlockTimestamp(middle) <= timestamp) low = middle
    else high = middle - 1
  }

  return low
}

function getBlockAtOrBefore(timestamp) {
  if (!timestampBlockPromises.has(timestamp))
    timestampBlockPromises.set(timestamp, findBlockAtOrBefore(timestamp))

  return timestampBlockPromises.get(timestamp)
}

async function starknetCall(contractAddress, entrypoint, blockNumber) {
  return rpc('starknet_call', [
    {
      contract_address: contractAddress,
      entry_point_selector: hash.getSelectorFromName(entrypoint),
      calldata: [],
    },
    { block_number: blockNumber },
  ])
}

function parseUint256(result) {
  return BigInt(result[0] ?? 0) + (BigInt(result[1] ?? 0) << 128n)
}

function normalizeFelt(value) {
  return `0x${BigInt(value).toString(16)}`
}

function normalizeEvmAddress(value) {
  return `0x${BigInt(value).toString(16).padStart(40, '0')}`
}

async function fetchRegistryEvents() {
  const events = []
  let continuationToken

  do {
    const filter = {
      from_block: { block_number: REGISTRY_DEPLOYMENT_BLOCK },
      to_block: 'latest',
      address: REGISTRY,
      keys: [[VTOKEN_ADDED, OMNICHAIN_VTOKEN_ADDED]],
      chunk_size: 1000,
    }

    if (continuationToken) filter.continuation_token = continuationToken

    const page = await rpc('starknet_getEvents', [filter])
    events.push(...page.events)
    continuationToken = page.continuation_token
  } while (continuationToken)

  return events.map((event) => {
    if (BigInt(event.keys[0]) === BigInt(VTOKEN_ADDED)) {
      return {
        type: 'legacy',
        block: event.block_number,
        vToken: normalizeFelt(event.keys[1]),
      }
    }

    return {
      type: 'omnichain',
      block: event.block_number,
      vToken: normalizeFelt(event.keys[1]),
      gateway: normalizeEvmAddress(event.data[0]),
      asset: normalizeEvmAddress(event.keys[3]),
      lzEid: Number(BigInt(event.data[2])),
    }
  })
}

async function getRegisteredVaults(timestamp) {
  const block = timestamp ? await getBlockAtOrBefore(timestamp) : await rpc('starknet_blockNumber', [])
  if (block === null) return { block: null, vaults: [] }
  const events = await fetchRegistryEvents()
  const vaults = events.filter(({ block: eventBlock }) => eventBlock <= block)
  for (const vault of vaults) {
    if (vault.type === 'omnichain' && !PRICE_CHAIN_BY_LZ_EID[vault.lzEid])
      throw new Error(`Missing price-chain mapping for LayerZero endpoint ${vault.lzEid}`)
  }
  return { block, vaults }
}

// Starknet: legacy vaults hold their underlying on Starknet - counted at total_assets() in the vault's asset().
async function starknetTvl(api) {
  const { block, vaults } = await getRegisteredVaults(api.timestamp)
  if (block === null) return
  const legacyVaults = vaults.filter(({ type }) => type === 'legacy')

  const balances = await Promise.all(legacyVaults.map(async ({ vToken }) => {
    const [assetResult, totalAssetsResult] = await Promise.all([
      starknetCall(vToken, 'asset', block),
      starknetCall(vToken, 'total_assets', block),
    ])
    return { asset: normalizeFelt(assetResult[0]), amount: parseUint256(totalAssetsResult) }
  }))

  balances.forEach(({ asset, amount }) => api.add(asset, amount))
}

async function tvl(api) {
  const { block, vaults } = await getRegisteredVaults(api.timestamp)
  if (block === null) return
  const chainVaults = vaults.filter(({ type, lzEid }) => type === 'omnichain' && PRICE_CHAIN_BY_LZ_EID[lzEid] === api.chain)
  if (!chainVaults.length) return

  const custodyWallets = await api.multiCall({ abi: 'address:mpcWallet', calls: chainVaults.map(({ gateway }) => gateway) })
  const collateral = await api.multiCall({ abi: 'erc20:balanceOf', calls: chainVaults.map(({ asset }, i) => ({ target: asset, params: [custodyWallets[i]] })) })
  chainVaults.forEach(({ asset }, i) => api.add(asset, collateral[i]))
}

module.exports = {
  start: '2026-06-05',
  timetravel: true,
  doublecounted: true,
  methodology: 'Discovers vaults from the ArcX Registry on Starknet. Legacy vaults contribute total_assets in their underlying Starknet token. Omnichain vault collateral is custodied in a per-vault MPC wallet, counted as that wallet\'s balance and attributed to the source chain. ST and EPT are excluded to avoid counting the same capital twice. Legacy capital is deployed through Wildcat, so the adapter is marked doublecounted.',
  starknet: { tvl: starknetTvl },
}

for (const chain of new Set(Object.values(PRICE_CHAIN_BY_LZ_EID)))
  module.exports[chain] = { tvl }
