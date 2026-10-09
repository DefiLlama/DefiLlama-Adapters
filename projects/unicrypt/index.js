const { config, protocolPairs, tokens, stakingContracts,
  ethereumContractData, baseContractData, bscContractData, polygonContractData,
  avalancheContractData, gnosisContractData, arbitrumContractData, optimismContractData, robinhoodContractData, } = require('./config')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")
const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { getUniqueAddresses } = require('../helper/utils');

const project = 'bulky/unicrypt'

function tvl(contracts) {
  return async function tvl(api) {
    const cache = (await getCache(project, api.chain)) || {}
    if (!cache.vaults) cache.vaults = {}

    for (const entry of contracts) {
      const vault = entry.contract.toLowerCase()
      if (!cache.vaults[vault]) cache.vaults[vault] = { tokens: [], lastTotalDepositId: 0 }
      const cCache = cache.vaults[vault]

      // only pull lock indices added since last run
      const size = +await api.call({ target: vault, abi: entry.getNumLockedTokensABI, })
      const calls = Array.from({ length: Math.max(0, size - cCache.lastTotalDepositId) }, (_, i) => ({ target: vault, params: i + cCache.lastTotalDepositId }))
      cCache.lastTotalDepositId = size

      const tokens = await api.multiCall({ abi: entry.getLockedTokenAtIndexABI, calls, permitFailure: true })
      cCache.tokens = getUniqueAddresses([...cCache.tokens, ...tokens.filter(Boolean)])

      const blacklist = [...(entry.pool2 || [])]
      if (api.chain === 'ethereum') blacklist.push('0x72E5390EDb7727E3d4e3436451DADafF675dBCC0') // HANU

      await vestingHelper({ api, cache, owner: vault, useDefaultCoreAssets: true, blacklist, tokens: cCache.tokens, })
    }

    await setCache(project, api.chain, cache)
  }
}

module.exports = {
  isHeavyProtocol: true,
  misrepresentedTokens: true,
  methodology:
    `Counts each LP pair's native token and
   stable balance, adjusted to reflect locked pair's value.
   Balances and merged across multiple
   locker and staking contracts to return sum TVL per chain`,

  ethereum: {
    staking: stakings(
      stakingContracts,
      tokens.uncx_eth,
      config.uniswapv2.chain
    ),
    tvl: tvl(ethereumContractData),

    pool2: pool2s([config.uniswapv2.locker, config.pol.locker],
      [protocolPairs.uncx_WETH],
      config.uniswapv2.chain)
  },
  base: {
    tvl: tvl(baseContractData)
  },
  bsc: {
    tvl: tvl(bscContractData),

    pool2: pool2s([config.pancakeswapv2.locker, config.pancakeswapv1.locker, config.safeswap.locker,
    config.julswap.locker, config.biswap.locker],
      [protocolPairs.uncx_BNB], config.pancakeswapv2.chain)
  },
  polygon: {
    tvl: tvl(polygonContractData)
  },
  avax: { tvl: tvl(avalancheContractData) },
  arbitrum: { tvl: tvl(arbitrumContractData) },
  optimism: { tvl: tvl(optimismContractData) },
  robinhood: { tvl: tvl(robinhoodContractData) },
  xdai: {
    tvl: tvl(gnosisContractData),
    pool2: pool2s([config.honeyswap.locker],
      [protocolPairs.uncx_XDAI],
      config.honeyswap.chain)
  },
}
