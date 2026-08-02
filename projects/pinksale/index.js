const sdk = require("@defillama/sdk")
const abi = {
  getTotalLockCount: "uint256:getTotalLockCount",
  getLock: "function getLock(uint256 index) view returns (tuple(uint256 id, address token, address owner, uint256 amount, uint256 lockDate, uint256 unlockDate))",
  getLockAt: "function getLockAt(uint256 index) view returns (tuple(uint256 id, address token, address owner, uint256 amount, uint256 lockDate, uint256 tgeDate, uint256 tgeBps, uint256 cycle, uint256 cycleBps, uint256 unlockedAmount, string description))",
};
const config = {
  bsc: {
    vaults: [
      '0x7ee058420e5937496F5a2096f04caA7721cF70cc',
      '0x407993575c91ce7643a4d4cCACc9A98c36eE1BBE',
    ],
    blacklist: [
      '0x602ba546a7b06e0fc7f58fd27eb6996ecc824689',
      '0x17e65e6b9b166fb8e7c59432f0db126711246bc0',
      '0xee6cacddd3a9370d87db581ee6728226883578e5',
      '0x6d163b653010740bfb41bed4bee23f94b3285cba',
      '0xb0228eb6c0b49f8265e6e161c3a987eed7471f42',
      '0x9888d3d9fbc12487259d1c82665b2ffd009936c6',
      '0x49a9f9a2271d8c5da44c57e7102aca79c222f4a9',
      '0x25f6212eb410e22956856ccb0383ec1a86fceaf9',
      '0x851b7cb21d7428fa1ed87a7c45da8048079b0a90',
      '0xb08f67c04bfdf069017365969ca19a0ae6e66b85',
      '0x4aee9d30893c5c73e5a5b8637a10d9537497f1c8',
      '0x9FBff386a9405b4C98329824418ec02b5C20976b',
      '0xa0b3c4f174f4bb51039adaecf2af0e4ef5925f7d',
      '0xde65be98bfc08a3150a491dfa84df8b02ba6c6ac',
      '0x16e733e1939dfa57c2b65891ab12329121087777',
      '0x9024f9e3691c34012443e36d93fab06b15617777'
    ],
    log_coreAssetPrices: [
      300/ 1e18,
      1/ 1e18,
      1/ 1e18,
      1/ 1e18,
    ],
    log_minTokenValue: 1e6,
  },
  ethereum: {
    vaults: [
      '0x33d4cC8716Beb13F814F538Ad3b2de3b036f5e2A',
      '0x71B5759d73262FBb223956913ecF4ecC51057641',
    ],
    blacklist: [
      '0xd626661e2d4f93a1c4122d386fa9ea0f62b5ab0b',
    ],
  },
  polygon: {
    vaults: [
      '0x5fb71Dbf7248a01bf96cE2AB2DA34EEAbE58c261',
      '0x6C9A0D8B1c7a95a323d744dE30cf027694710633',
    ],
  },
  avax: {
    vaults: [
      '0x4DffB05d1Bc222A2852799e2076e956acb589322',
      '0x9479C6484a392113bB829A15E7c9E033C9e70D30',
    ],
  },
  fantom: {
    vaults: [
      '0xdd6e31a046b828cbbafb939c2a394629aff8bbdc',
      '0x0E1757b9d6501e60B2e4Ca0D000e49532948CF6c',
    ],
  },
  cronos: {
    vaults: [
      '0xdD6E31A046b828CbBAfb939C2a394629aff8BBdC',
      '0x102137A9F278B013419332f82aCEA429D944Fc34',
    ],
  },
};
const { getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")

const project = 'bulky/pinksale'

module.exports = {}

async function runInBatches(items, batchSize, fn) {
  for (let i = 0; i < items.length; i += batchSize) {
    await Promise.all(items.slice(i, i + batchSize).map(fn))
  }
}

const tvl = async (api) => {
  const balances = {}
  const cache = await getCache(project, api.chain || { vaults: {} })
  const { vaults, blacklist, log_coreAssetPrices, log_minTokenValue, } = config[api.chain]

  await Promise.all(
    vaults.map(async (vault, idx) => {
      if (!cache.vaults) cache.vaults = {}
      if (!cache.vaults[vault]) cache.vaults[vault] = { lastTotalId: 0, tokens: [] }
      const cCache = cache.vaults[vault]

      const size = await api.call({ target: vault, abi: abi.getTotalLockCount })
      const isLastVault = idx === vaults.length - 1
      const lockAbi = isLastVault ? abi.getLockAt : abi.getLock

      const calls = Array.from({ length: +size - cCache.lastTotalId }, (_, i) => ({ target: vault, params: i + cCache.lastTotalId }))
      cCache.lastTotalId = +size

      const tokens = await api.multiCall({ abi: lockAbi, calls, permitFailure: true })
      tokens.forEach(lock => { if (lock?.token) cCache.tokens.push(lock.token) })
      cCache.tokens = getUniqueAddresses(cCache.tokens.filter(i => i))
    })
  )

  await runInBatches(vaults, 5, async (vault) => {
    const cCache = cache.vaults[vault]

    const balance = await vestingHelper({
      cache,
      useDefaultCoreAssets: true,
      blacklist,
      owner: vault,
      tokens: cCache.tokens,
      block: api.block,
      chain: api.chain,
      log_coreAssetPrices,
      log_minTokenValue,
    })

    Object.entries(balance).forEach(([token, bal]) =>
      sdk.util.sumSingleBalance(balances, token, bal)
    )
  })

  await setCache(project, api.chain, cache)
  return balances
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})