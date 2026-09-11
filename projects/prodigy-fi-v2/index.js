const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getCache, setCache } = require('../helper/cache')

const positionManager_ABI = {
  getDeployedVaultCount: 'uint256:getDeployedVaultCount',
  getDeployedVaults: 'function getDeployedVaults(uint256,uint256) view returns (address[])',
}
const ZERO_ADDRESS = ADDRESSES.null
const CACHE_PROJECT = 'prodigy-v2'

const config = {
  ethereum: {
    positionManager: '0x50aB3FE7d089c4F0dD8096aAeA9578f8E7B18AF7',
    collateralPools: [
      '0x864cd49392a4348b5da5337623d994151610D0a3',
      '0xe1303B2514755A72da4AcA9B917d96F16c842c80',
    ],
    tokens: [
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDC,
    ],
  },
  hyperliquid: {
    positionManager: '0x50aB3FE7d089c4F0dD8096aAeA9578f8E7B18AF7',
    collateralPools: [
      '0x864cd49392a4348b5da5337623d994151610D0a3',
      '0xe1303B2514755A72da4AcA9B917d96F16c842c80',
    ],
    tokens: [
      ADDRESSES.hyperliquid.USDC,
      ADDRESSES.hyperliquid.WHYPE,
      '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463',
      '0xBe6727B535545C67d5cAa73dEa54865B92CF7907',
    ],
  },
  base: {
    positionManager: '0x50aB3FE7d089c4F0dD8096aAeA9578f8E7B18AF7',
    collateralPools: [
      '0x864cd49392a4348b5da5337623d994151610D0a3',
      '0xe1303B2514755A72da4AcA9B917d96F16c842c80',
    ],
    tokens: [
      ADDRESSES.base.WETH,
      ADDRESSES.base.USDC,
      ADDRESSES.base.cbBTC,
      '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
      '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
      '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196',
      '0x63706e401c06ac8513145b7687A14804d17f814b',
      '0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415',
      '0x4F9Fd6Be4a90f2620860d680c0d4d5Fb53d1A825',
      '0x98d0baa52b2D063E780DE12F615f963Fe8537553',
      '0xA99F6e6785Da0F5d6fB42495Fe424BCE029Eeb3E',
    ],
  },
  berachain: {
    positionManager: '0x50aB3FE7d089c4F0dD8096aAeA9578f8E7B18AF7',
    collateralPools: [
      '0x864cd49392a4348b5da5337623d994151610D0a3',
      '0xe1303B2514755A72da4AcA9B917d96F16c842c80',
    ],
    tokens: [
      ADDRESSES.berachain.WBTC,
      ADDRESSES.berachain.WETH,
      ADDRESSES.berachain.WBERA,
      ADDRESSES.berachain.USDC,
    ],
  },
}

/**
 * Returns the cached list of Prodigy.Fi vaults that hold collateral directly
 * (i.e. `collateralPool()` returns the zero address), incrementally scanning
 * newly deployed vaults from the positionManager since the previous run.
 *
 * @param {object} api - DefiLlama ChainApi bound to the current chain.
 * @param {string} positionManager - positionManager contract address for this chain.
 * @returns {Promise<string[]>} Addresses of self-collateralised vaults.
 */
async function getSelfCollateralisedVaults(api, positionManager) {
  const cache = (await getCache(CACHE_PROJECT, api.chain)) || {}
  const selfCollateralised = cache.selfCollateralised || []
  const scanned = cache.scanned || 0

  const total = Number(await api.call({ target: positionManager, abi: positionManager_ABI.getDeployedVaultCount }))
  if (scanned >= total) return selfCollateralised

  const fetchChunk = 200
  const pageCalls = []
  for (let i = scanned; i < total; i += fetchChunk) {
    pageCalls.push({ target: positionManager, params: [i, Math.min(fetchChunk, total - i)] })
  }
  const pages = await api.multiCall({ abi: positionManager_ABI.getDeployedVaults, calls: pageCalls })
  const newVaults = pages.flat()

  const collateralPools = await api.multiCall({ abi: 'address:collateralPool', calls: newVaults, permitFailure: true })
  collateralPools.forEach((cp, i) => {
    if (cp === ZERO_ADDRESS) selfCollateralised.push(newVaults[i])
  })

  await setCache(CACHE_PROJECT, api.chain, { selfCollateralised, scanned: total })
  return selfCollateralised
}

/**
 * Computes Prodigy.Fi TVL on the active chain by summing the configured
 * trading-pair tokens held by the chain's collateral pools and by every
 * self-collateralised vault discovered through the positionManager.
 *
 * @param {object} api - DefiLlama ChainApi bound to the current chain.
 * @returns {Promise<object>} Balance map produced by `sumTokens2`.
 */
async function tvl(api) {
  const { positionManager, collateralPools, tokens } = config[api.chain]
  const selfCollateralisedVaults = await getSelfCollateralisedVaults(api, positionManager)
  return sumTokens2({ api, tokens, owners: collateralPools.concat(selfCollateralisedVaults) })
}

module.exports = {
  methodology: 'Tokens deposits into the dual currency investment vaults and a shared collateral pool.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
