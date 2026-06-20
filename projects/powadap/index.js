const sdk = require("@defillama/sdk")
const { get } = require("../helper/http");
const abi = {
  //Lockers
  getTotalLockCount: "uint256:getTotalLockCount",
  getLockAt: "function getLockAt(uint256 index) view returns (tuple(uint256 id, address token, address owner, uint256 amount, uint256 lockDate, uint256 tgeDate, uint256 tgeBps, uint256 cycle, uint256 cycleBps, uint256 unlockedAmount, string description))",
};
const config = {
  bsc: {
    vaults: [
      '0x8F1af74e904ED74Ea1Ed0151fC51D5A2d5a8D628',
    ],
    blacklist: [

    ],
    log_coreAssetPrices: [

    ],
    log_minTokenValue: 1e6,
  },
  genesys: {
    vaults: [
      '0x8B1A8566132508A1Dde0e7091c24e33357A9E23D',
    ],
  },
  base: {
    vaults: [
      '0xAd2B027C262042afef8dd9aFbE7F73D1183Ff00b',
    ],
  },
  
};
const { getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper,  } = require("../helper/unknownTokens")

const project = 'bulky/powadap'

module.exports = {}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (timestamp, _block, { [chain]: block }) => {
      const cache = await getCache(project, chain) || { vaults: {} }
      const balances = {}
      const { vaults, blacklist, log_coreAssetPrices, log_minTokenValue, } = config[chain]
      for (const vault of vaults) {
        if (!cache.vaults) cache.vaults = {}
        if (!cache.vaults[vault]) cache.vaults[vault] = { lastTotalId: 0, tokens: [], }
        const cCache = cache.vaults[vault]

        let calls = []
        const { output: size } = await sdk.api.abi.call({
          target: vault,
          abi: abi.getTotalLockCount,
          chain, block,
        })

        const lockAbi =  abi.getLockAt
        for (let i = cCache.lastTotalId; i < +size; i++)
          calls.push({ params: i })
        cCache.lastTotalId = +size

        let { output: tokens } = await sdk.api.abi.multiCall({
          target: vault,
          abi: lockAbi,
          calls, chain, block,
          permitFailure: true,
        })

        tokens.filter(i => i.output).map(i => cCache.tokens.push(i.output[1]))
        
        cCache.tokens = getUniqueAddresses(cCache.tokens)

        const balance = await vestingHelper({
          cache,
          useDefaultCoreAssets: true,
          blacklist,
          owner: vault,
          tokens: cCache.tokens,
          block, chain,
          log_coreAssetPrices,
          log_minTokenValue,
        })
        await setCache(project, chain, cache)

        Object.entries(balance).forEach(([token, bal]) => sdk.util.sumSingleBalance(balances, token, bal))
      }

      return balances
    }

  }
})
