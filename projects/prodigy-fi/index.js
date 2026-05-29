const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getCache, setCache } = require('../helper/cache')

const FACTORY_ABI = {
  getDeployedVaultCount: 'uint256:getDeployedVaultCount',
  getDeployedVaults: 'function getDeployedVaults(uint256,uint256) view returns (address[])',
}
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const CACHE_PROJECT = 'prodigy-fi'

const config = {
  ethereum: {
    factory: '0xAC2a612C49f29e26858Df1a53f7623180bcc3753',
    collateralPools: [
      '0x18D87BB647cf70065e9Eb286957AD7681f4373d7',
      '0xb2d5c91F1e71078672F55C63ac0BBC3A9B1b3889',
    ],
    tokens: [
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDC,
    ],
  },
  base: {
    factory: '0xFE198B51cfb1F96b56c63fe323a934BEAAA3b281',
    collateralPools: [
      '0x4999b48c62D45708809Ea8a04516aA09BA3459d5',
      '0x2e1E454D9Ad7528ab668Fc919db3958e988f6485',
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
    factory: '0x29ca87b2f744127606ada4564da8219be6498ca1',
    collateralPools: [
      '0x5d53e5BC2ed68BB19f16D2D525039bAB2eC1f4c1',
      '0x999A87E0148eA3023b7AeFDB0D7d7D21781704a2',
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
 * newly deployed vaults from the factory since the previous run.
 *
 * @param {object} api - DefiLlama ChainApi bound to the current chain.
 * @param {string} factory - Factory contract address for this chain.
 * @returns {Promise<string[]>} Addresses of self-collateralised vaults.
 */
async function getSelfCollateralisedVaults(api, factory) {
  const cache = (await getCache(CACHE_PROJECT, api.chain)) || {}
  const selfCollateralised = cache.selfCollateralised || []
  const scanned = cache.scanned || 0

  const total = Number(await api.call({ target: factory, abi: FACTORY_ABI.getDeployedVaultCount }))
  if (scanned >= total) return selfCollateralised

  const fetchChunk = 200
  const pageCalls = []
  for (let i = scanned; i < total; i += fetchChunk) {
    pageCalls.push({ target: factory, params: [i, Math.min(fetchChunk, total - i)] })
  }
  const pages = await api.multiCall({ abi: FACTORY_ABI.getDeployedVaults, calls: pageCalls })
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
 * self-collateralised vault discovered through the factory.
 *
 * @param {object} api - DefiLlama ChainApi bound to the current chain.
 * @returns {Promise<object>} Balance map produced by `sumTokens2`.
 */
async function tvl(api) {
  const { factory, collateralPools, tokens } = config[api.chain]
  const selfCollateralisedVaults = await getSelfCollateralisedVaults(api, factory)
  return sumTokens2({ api, tokens, owners: collateralPools.concat(selfCollateralisedVaults) })
}

module.exports = {
  methodology: 'TVL counts the trading-pair tokens held in Prodigy.Fi collateral pools, plus tokens held directly by self-collateralised vaults, on Ethereum, Base, and Berachain.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
