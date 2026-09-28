const config = require("./config");
const {
  getStorageLPLockDataV33,
  getLockCountPerContractV3,
  getLockerPerWalletV3,
  getLockerWalletWithIdV3,
  getLockerLPDataV3,
  getStorageLockCountV33,
} = require("./abis");
const { getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, sumUnknownTokens, } = require("../helper/unknownTokens")

const project = 'bulky/dxsale'

// [from, to) as { target, params: i } calls
const rangeCalls = (target, from, to) => Array.from({ length: Math.max(0, to - from) }, (_, i) => ({ target, params: from + i }))

function getTVLTotal(args) {
  return async (api) => {
    const cache = (await getCache(project, api.chain)) || {}
    if (!cache.v3LPData) cache.v3LPData = []
    if (!cache.v3Contracts) cache.v3Contracts = {}
    if (!cache.lockContracts) cache.lockContracts = {}

    await addV3Lps()

    // Locks from archive contracts
    for (const lock of args.locks)
      await addLockLPs(lock)

    await setCache(project, api.chain, cache)

    async function addLockLPs(lockContract) {
      if (!cache.lockContracts[lockContract]) cache.lockContracts[lockContract] = { lastTotalLocks: 0, walletIds: [], tokens: [], walletConfig: {} }
      const cCache = cache.lockContracts[lockContract]

      // new locker ids -> wallets
      const totalLocks = +await api.call({ target: lockContract, abi: getLockCountPerContractV3 })
      const newWallets = await api.multiCall({ abi: getLockerWalletWithIdV3, calls: rangeCalls(lockContract, cCache.lastTotalLocks || 0, totalLocks) })
      cCache.lastTotalLocks = totalLocks
      cCache.walletIds = getUniqueAddresses([...cCache.walletIds, ...newWallets])

      // per wallet, only the lock indices added since last run
      const counts = await api.multiCall({ abi: getLockerPerWalletV3, calls: cCache.walletIds.map(wallet => ({ target: lockContract, params: wallet })) })
      const calls = []
      cCache.walletIds.forEach((wallet, i) => {
        if (!cCache.walletConfig[wallet]) cCache.walletConfig[wallet] = { lastCount: 0 }
        const wCache = cCache.walletConfig[wallet]
        for (let j = wCache.lastCount; j < +counts[i]; j++) calls.push({ target: lockContract, params: [wallet, j] })
        wCache.lastCount = +counts[i]
      })

      const locks = await api.multiCall({ abi: getLockerLPDataV3, calls, permitFailure: true })
      cCache.tokens = getUniqueAddresses([...cCache.tokens, ...locks.map(i => i?.lpAddress).filter(Boolean)])

      await vestingHelper({ api, cache, useDefaultCoreAssets: true, owner: lockContract, tokens: cCache.tokens, })
    }

    async function addV3Lps() {
      for (const contract of args.storageLiquidityLocks) {
        if (!cache.v3Contracts[contract]) cache.v3Contracts[contract] = { lastTotalLocks: 0 }
        const cCache = cache.v3Contracts[contract]

        const totalLocks = +await api.call({ target: contract, abi: getStorageLockCountV33 })
        const lpData = await api.multiCall({ abi: getStorageLPLockDataV33, calls: rangeCalls(contract, cCache.lastTotalLocks || 0, totalLocks) })
        cCache.lastTotalLocks = totalLocks
        lpData.forEach(({ lockedLPTokens, lpLockContract }) => cache.v3LPData.push([lockedLPTokens, lpLockContract]))
      }

      // dedupe token/owner pairs so a cache reset can't double count
      const seen = new Set()
      cache.v3LPData = cache.v3LPData.filter(([token, owner]) => {
        const key = `${token}|${owner}`.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      await sumUnknownTokens({ api, tokensAndOwners: cache.v3LPData, useDefaultCoreAssets: true, cache, })
    }
  };
}

module.exports = {
  isHeavyProtocol: true,
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getTVLTotal(config[chain]) }
})
