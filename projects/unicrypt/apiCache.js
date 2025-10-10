const sdk = require('@defillama/sdk');
const { config, protocolPairs, tokens, stakingContracts,
  ethereumContractData, baseContractData, bscContractData, polygonContractData,
  avalancheContractData, gnosisContractData, arbitrumContractData, } = require('./config')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")
const project = 'bulky/unicrypt'

const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { getUniqueAddresses } = require('../helper/utils');

async function runInBatches(items, batchSize, fn) {
  for (let i = 0; i < items.length; i += batchSize) {
    await Promise.all(items.slice(i, i + batchSize).map(fn))
  }
}

function tvl(contracts) {
  return async function tvl(api) {
    const balances = {}
    const cache = await getCache(project, api.chain || { vaults: {} })

    await Promise.all(
      contracts.map(async (entry, idx) => {
        const vault = entry.contract.toLowerCase()
        if (!cache.vaults) cache.vaults = {}
        if (!cache.vaults[vault]) cache.vaults[vault] = { tokens: [], lastTotalDepositId: 0 }
        const cCache = cache.vaults[vault]

        const size = await api.call({ target: vault, abi: entry.getNumLockedTokensABI, })
        const calls = Array.from({ length: +size - cCache.lastTotalDepositId }, (_, i) => ({ target: vault, params: i + cCache.lastTotalDepositId }))
        cCache.lastTotalDepositId = +size

        const tokens = await api.multiCall({ abi: entry.getLockedTokenAtIndexABI, calls, permitFailure: true })
        tokens.forEach(({ token } = {}) =>  token  && cCache.tokens.push(token))
        cCache.tokens = getUniqueAddresses(cCache.tokens.filter(i => i))
      })
    )

    await runInBatches(contracts, 5, async (entry) => {
      const vault = entry.contract.toLowerCase()
      const cCache = cache.vaults[vault]

      const blacklist = [...(entry.pool2 || [])]
      if (api.chain === 'ethereum') blacklist.push('0x72E5390EDb7727E3d4e3436451DADafF675dBCC0') // HANU

      const balance = await vestingHelper({
        chain: api.chain,
        block: api.block,
        owner: vault,
        useDefaultCoreAssets: true,
        blacklist,
        tokens: cCache.tokens,
        cache,
      })

      Object.entries(balance).forEach(([token, bal]) =>
        sdk.util.sumSingleBalance(balances, token, bal)
      )
    })

    await setCache(project, api.chain, cache)
    return balances
  }
}

module.exports = {
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
  xdai: {
    tvl: tvl(gnosisContractData),
    pool2: pool2s([config.honeyswap.locker],
      [protocolPairs.uncx_XDAI],
      config.honeyswap.chain)
  },
}

