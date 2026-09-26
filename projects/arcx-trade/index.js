const { getSelectorFromName, toHex } = require('../helper/utils/starknet')
const starknet = require('../helper/chain/starknet')

const REGISTRY = '0x37ad81bcfa789e849216f5ea973c6ac22b5c9cdb05c29e9d5667252440d8300'
const REGISTRY_DEPLOYMENT_BLOCK = 10474202
const PRICE_CHAIN_BY_LZ_EID = { 30101: 'ethereum' }

const VTOKEN_ADDED = getSelectorFromName('VTokenAdded')
const OMNICHAIN_VTOKEN_ADDED = getSelectorFromName('OmnichainVTokenAdded')

const abi = {
  asset: { name: 'asset', type: 'function', inputs: [], outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }], state_mutability: 'view' },
  total_assets: { name: 'total_assets', type: 'function', inputs: [], outputs: [{ type: 'core::integer::u256' }], state_mutability: 'view' },
}

const normalizeEvmAddress = (value) => `0x${BigInt(value).toString(16).padStart(40, '0')}`

async function getRegisteredVaults() {
  const events = await starknet.getLogs({
    target: REGISTRY,
    fromBlock: REGISTRY_DEPLOYMENT_BLOCK,
    topics: [VTOKEN_ADDED, OMNICHAIN_VTOKEN_ADDED],
  })

  return events.map((event) => {
    if (BigInt(event.keys[0]) === BigInt(VTOKEN_ADDED))
      return { type: 'legacy', vToken: toHex(event.keys[1]) }

    const lzEid = Number(BigInt(event.data[2]))
    if (!PRICE_CHAIN_BY_LZ_EID[lzEid])
      throw new Error(`Missing price-chain mapping for LayerZero endpoint ${lzEid}`)

    return {
      type: 'omnichain',
      vToken: toHex(event.keys[1]),
      gateway: normalizeEvmAddress(event.data[0]),
      asset: normalizeEvmAddress(event.keys[3]),
      lzEid,
    }
  })
}

// Starknet: legacy vaults hold their underlying on Starknet - counted at total_assets() in the vault's asset().
async function starknetTvl(api) {
  const vaults = await getRegisteredVaults()
  const vTokens = vaults.filter(({ type }) => type === 'legacy').map(({ vToken }) => vToken)
  if (!vTokens.length) return
  const assets = await starknet.multiCall({ abi: abi.asset, calls: vTokens })
  const totalAssets = await starknet.multiCall({ abi: abi.total_assets, calls: vTokens })
  assets.forEach((asset, i) => api.add(toHex(asset), totalAssets[i].toString()))
}

async function tvl(api) {
  const vaults = await getRegisteredVaults()
  const chainVaults = vaults.filter(({ type, lzEid }) => type === 'omnichain' && PRICE_CHAIN_BY_LZ_EID[lzEid] === api.chain)
  if (!chainVaults.length) return

  const custodyWallets = await api.multiCall({ abi: 'address:mpcWallet', calls: chainVaults.map(({ gateway }) => gateway) })
  const collateral = await api.multiCall({ abi: 'erc20:balanceOf', calls: chainVaults.map(({ asset }, i) => ({ target: asset, params: [custodyWallets[i]] })) })
  chainVaults.forEach(({ asset }, i) => api.add(asset, collateral[i]))
}

module.exports = {
  start: '2026-06-05',
  timetravel: false,
  doublecounted: true,
  methodology: 'Discovers vaults from the ArcX Registry on Starknet. Legacy vaults contribute total_assets in their underlying Starknet token. Omnichain vault collateral is custodied in a per-vault MPC wallet, counted as that wallet\'s balance and attributed to the source chain. ST and EPT are excluded to avoid counting the same capital twice. Legacy capital is deployed through Wildcat, so the adapter is marked doublecounted.',
  starknet: { tvl: starknetTvl },
}

for (const chain of new Set(Object.values(PRICE_CHAIN_BY_LZ_EID)))
  module.exports[chain] = { tvl }
