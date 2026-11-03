const { getConfig } = require('../helper/cache')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs")
const ADDRESSES = require("../helper/coreAssets.json")
const sdk = require('@defillama/sdk')
const providers = require('@defillama/sdk/build/providers.json')

// Privacy Pools v2 (0xbow): one multi-asset PoolVault per chain holding the native coin and plain ERC20s
// directly. Deployments come from the ASP feed (entrypoint, poolVault, fromBlock per chainId); assets
// enabled on the Entrypoint come from its AssetConfigurationSet logs.
const ENTRYPOINTS_API = 'https://api-v2.0xbow.io/global/public/entrypoints'
// production contracts were deployed deterministically on 2026-09-01; the feed's fromBlock is the first
// deposit, which comes after the AssetConfigurationSet logs, so it cannot be used as the log start
const DEPLOY_TIMESTAMP = Math.floor(Date.parse('2026-09-01T00:00:00Z') / 1000)
const NATIVE = ADDRESSES.GAS_TOKEN_2

const abis = {
  assetConfigurationSet: 'event AssetConfigurationSet(address indexed _asset, (bool enabled, uint256 minAmount, uint256 vettingFeeBPS, uint256 maxRelayFee) _config)',
  assets: 'function assets(address) view returns ((bool enabled, uint256 minAmount, uint256 vettingFeeBPS, uint256 maxRelayFee))',
}

const chainByChainId = {}
Object.entries(providers).forEach(([chain, { chainId }]) => { if (chainId) chainByChainId[chainId] = chain })

async function getPool(chain) {
  const { pools } = await getConfig('privacypools-v2', ENTRYPOINTS_API)
  return pools.find(pool => chainByChainId[pool.chainId] === chain)
}

async function tvl(api) {
  const pool = await getPool(api.chain)
  if (!pool) return {}
  const { entrypoint, poolVault } = pool
  const fromBlock = await sdk.blocks.getBlockNumber(api.chain, DEPLOY_TIMESTAMP)

  const logs = await getLogs2({ api, target: entrypoint, eventAbi: abis.assetConfigurationSet, fromBlock })
  let assets = [...new Set(logs.map(log => log._asset.toLowerCase()))]
  const configs = await api.multiCall({ abi: abis.assets, calls: assets, target: entrypoint })
  assets = assets.filter((_, i) => configs[i].enabled)

  // yield assets (PPYieldToken, ERC4626 over Aave aTokens) hold the underlying aToken themselves, so count
  // the wrapper's aToken balance instead of the shares sitting in the PoolVault
  const erc20s = assets.filter(a => a !== NATIVE)
  const underlyings = await api.multiCall({ abi: 'address:asset', calls: erc20s, permitFailure: true })

  const tokensAndOwners = []
  if (assets.includes(NATIVE)) tokensAndOwners.push([nullAddress, poolVault])
  erc20s.forEach((token, i) => {
    const underlying = underlyings[i]
    if (underlying) tokensAndOwners.push([underlying, token])
    else tokensAndOwners.push([token, poolVault])
  })
  return sumTokens2({ api, tokensAndOwners })
}

// chains currently listed by the ASP feed
const chains = ['ethereum', 'bsc', 'citrea', 'optimism', 'base', 'arbitrum', 'robinhood']
chains.forEach(chain => { module.exports[chain] = { tvl } })

module.exports.methodology = 'Balances of every asset enabled on the Privacy Pools v2 Entrypoint held by the PoolVault. Deployments are read from the 0xbow ASP entrypoints feed.'
module.exports.start = '2026-09-01'
