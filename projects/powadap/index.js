const { getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache } = require('../helper/cache')
const { vestingHelper } = require('../helper/unknownTokens')

const abi = {
  getTotalLockCount: 'uint256:getTotalLockCount',
  getLockAt: 'function getLockAt(uint256 index) view returns (tuple(uint256 id, address token, address owner, uint256 amount, uint256 lockDate, uint256 tgeDate, uint256 tgeBps, uint256 cycle, uint256 cycleBps, uint256 unlockedAmount, string description))',
}

const config = {
  bsc: { vaults: ['0x8F1af74e904ED74Ea1Ed0151fC51D5A2d5a8D628'], log_minTokenValue: 1e6 },
  genesys: { vaults: ['0x8B1A8566132508A1Dde0e7091c24e33357A9E23D'] },
  base: { vaults: ['0xAd2B027C262042afef8dd9aFbE7F73D1183Ff00b'] },
}

const project = 'bulky/powadap'

async function tvl(api) {
  const { chain } = api
  const cache = await getCache(project, chain) || {}
  if (!cache.vaults) cache.vaults = {}
  const { vaults, blacklist, log_coreAssetPrices, log_minTokenValue } = config[chain]

  for (const vault of vaults) {
    if (!cache.vaults[vault]) cache.vaults[vault] = { lastTotalId: 0, tokens: [] }
    const cCache = cache.vaults[vault]

    const size = await api.call({ target: vault, abi: abi.getTotalLockCount })
    const locks = await api.fetchList({ target: vault, lengthAbi: abi.getTotalLockCount, itemAbi: abi.getLockAt, startFrom: cCache.lastTotalId, itemCount: +size, permitFailure: true })
    cCache.lastTotalId = +size

    locks.filter(i => i).forEach(i => cCache.tokens.push(i.token))
    cCache.tokens = getUniqueAddresses(cCache.tokens)

    const balances = await vestingHelper({
      cache, useDefaultCoreAssets: true,
      blacklist, owner: vault, tokens: cCache.tokens,
      chain, block: api.block,
      log_coreAssetPrices, log_minTokenValue,
    })
    api.addBalances(balances)
  }

  await setCache(project, chain, cache)
}

module.exports = {}
Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
