const yaml = require('js-yaml')
const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const REGISTRY_URL = 'https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/deployments/warp_routes/warpRouteConfigs.yaml'

const COLLATERAL_STANDARDS = new Set([
  'EvmHypCollateral',
  'EvmHypCollateralFiat',
  'EvmHypOwnerCollateral',
  'EvmHypRebaseCollateral',
])

const NATIVE_STANDARDS = new Set(['EvmHypNative'])

const CHAIN_MAP = {
  avalanche: 'avax',
  gnosis: 'xdai',
  hyperevm: 'hyperliquid',
  zoramainnet: 'zora',
  swell: 'swellchain',
}

let _registry
async function fetchRegistry() {
  if (!_registry) {
    const data = await getConfig('hyperlane/warp-routes', REGISTRY_URL)
    _registry = yaml.load(data)
  }
  return _registry
}

function getTokensAndOwners(registry, chain) {
  const tokensAndOwners = []
  for (const route of Object.values(registry)) {
    for (const token of route.tokens || []) {
      const registryChain = CHAIN_MAP[token.chainName] || token.chainName
      if (registryChain !== chain) continue

      if (COLLATERAL_STANDARDS.has(token.standard) && token.collateralAddressOrDenom) {
        tokensAndOwners.push([token.collateralAddressOrDenom, token.addressOrDenom])
      } else if (NATIVE_STANDARDS.has(token.standard)) {
        tokensAndOwners.push([ADDRESSES.null, token.addressOrDenom])
      }
    }
  }
  return tokensAndOwners
}

async function tvl(api) {
  const registry = await fetchRegistry()
  const tokensAndOwners = getTokensAndOwners(registry, api.chain)
  return sumTokens2({ api, tokensAndOwners })
}

// All chains that have collateral/native warp routes in the registry
const chains = [
  'arbitrum', 'avax', 'base', 'blast', 'bsc', 'celo', 'ethereum',
  'xdai', 'hyperliquid', 'ink', 'linea', 'mantle', 'metis', 'mint',
  'mode', 'optimism', 'polygon', 'scroll', 'sei', 'sonic',
  'swellchain', 'unichain', 'zora', 'plume', 'plasma',
  'vana', 'bsquared',
]

module.exports = {
  methodology: 'TVL counts the tokens locked in Hyperlane Warp Route collateral contracts, fetched dynamically from the Hyperlane registry.',
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
