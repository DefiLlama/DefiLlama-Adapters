const axios = require('axios')
const { hash } = require('starknet')
const BigNumber = require('bignumber.js')

const CONFIGURED_STARKNET_RPC = process.env.STARKNET_RPC
const STARKNET_RPC = !CONFIGURED_STARKNET_RPC || CONFIGURED_STARKNET_RPC.includes('rpc.starknet.lava.build')
  ? 'https://api.cartridge.gg/x/starknet/mainnet'
  : CONFIGURED_STARKNET_RPC
const REGISTRY = '0x37ad81bcfa789e849216f5ea973c6ac22b5c9cdb05c29e9d5667252440d8300'
const REGISTRY_DEPLOYMENT_BLOCK = 10474202
const START = 1780637758 // 2026-06-05 05:35:58 UTC, first non-zero ArcX TVL
// Source chains identify prices only; all balance reads and TVL attribution are Starknet.
const PRICE_CHAIN_BY_LZ_EID = { 30101: 'ethereum' }

const VTOKEN_ADDED = hash.getSelectorFromName('VTokenAdded')
const OMNICHAIN_VTOKEN_ADDED = hash.getSelectorFromName('OmnichainVTokenAdded')

let requestId = 0
let registryEventsPromise
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
      asset: normalizeEvmAddress(event.keys[3]),
      lzEid: Number(BigInt(event.data[2])),
    }
  })
}

function getRegistryEvents() {
  if (!registryEventsPromise) registryEventsPromise = fetchRegistryEvents()
  return registryEventsPromise
}

async function starknetTvl(api) {
  const block = api.block ?? await getBlockAtOrBefore(api.timestamp)
  if (block === null) return

  const events = await getRegistryEvents()
  const vaults = events.filter(({ block: eventBlock }) => eventBlock <= block)
  const omnichainVaults = vaults.filter(({ type }) => type === 'omnichain')
  const priceTokens = omnichainVaults.map(({ lzEid, asset }) => {
    const chain = PRICE_CHAIN_BY_LZ_EID[lzEid]
    if (!chain) throw new Error(`Missing price-chain mapping for LayerZero endpoint ${lzEid}`)
    return `${chain}:${asset}`
  })

  // Price-service metadata converts Starknet units to source-token units without EVM calls.
  // USD prices themselves are applied by DefiLlama at the requested timestamp.
  const tokenMetadata = {}
  for (let i = 0; i < priceTokens.length; i += 20) {
    const { data } = await axios.get(`https://coins.llama.fi/prices/current/${priceTokens.slice(i, i + 20).join(',')}`)
    Object.assign(tokenMetadata, data.coins)
  }

  const balances = await Promise.all(vaults.map(async ({ type, vToken, lzEid, asset }) => {
    if (type === 'omnichain') {
      const priceToken = `${PRICE_CHAIN_BY_LZ_EID[lzEid]}:${asset}`
      const sourceDecimals = tokenMetadata[priceToken]?.decimals
      if (!Number.isInteger(sourceDecimals)) throw new Error(`Missing token decimals for ${priceToken}`)

      const [supplyResult, decimalsResult] = await Promise.all([
        starknetCall(vToken, 'total_supply', block),
        starknetCall(vToken, 'decimals', block),
      ])
      const decimals = Number(BigInt(decimalsResult[0]))
      const amount = BigNumber(parseUint256(supplyResult).toString()).shiftedBy(sourceDecimals - decimals).toFixed()
      return { asset: priceToken, amount, skipChain: true }
    }

    const [assetResult, totalAssetsResult] = await Promise.all([
      starknetCall(vToken, 'asset', block),
      starknetCall(vToken, 'total_assets', block),
    ])

    return {
      asset: normalizeFelt(assetResult[0]),
      amount: parseUint256(totalAssetsResult),
    }
  }))

  balances.forEach(({ asset, amount, skipChain = false }) => api.add(asset, amount, { skipChain }))
}

module.exports = {
  start: START,
  timetravel: true,
  doublecounted: true,
  methodology: 'Discovers vaults from the ArcX Registry on Starknet. Legacy vaults contribute total_assets in their underlying token. Omnichain vaults contribute their Starknet total_supply, normalized by token decimals and valued as 1:1 claims on the registered source asset using DefiLlama prices. All TVL is attributed to Starknet. Source-chain backing and transfers in flight are not measured; ST and EPT are excluded to avoid counting the same capital twice. Legacy capital is deployed through Wildcat, so the adapter is marked doublecounted.',
  starknet: { tvl: starknetTvl },
}
