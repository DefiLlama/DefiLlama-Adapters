const sdk = require("@defillama/sdk");
const config = require("./config");
const {
  getStorageLPLockDataV33,
  getLockCountPerContractV3,
  getLockerPerWalletV3,
  getLockerWalletWithIdV3,
  getLockerLPDataV3,
  getStorageLockCountV33,
} = require("./abis");
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, sumUnknownTokens, } = require("../helper/unknownTokens")

const project = 'bulky/dxsale'

function getTVLTotal(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    const chain = args.chain;
    const block = chainBlocks[chain];
    const cache = await getCache(project, chain) || {}
    if (!cache.v3LPData) cache.v3LPData = []
    if (!cache.lockContracts) cache.lockContracts = {}

    await addV3Lps()

    //Get Locks from Archives
    for (const lock of args.locks)
      await addlockLPs(lock)

    await setCache(project, chain, cache)
    return balances;

    async function addlockLPs(lockContract) {
      if (!cache.lockContracts[lockContract]) cache.lockContracts[lockContract] = { walletIds: [], tokens: [], walletConfig: {} }
      const cCache = cache.lockContracts[lockContract]
      const wCache = cCache.walletConfig
      const walletIdSet = new Set()
      cCache.walletIds.forEach(i => walletIdSet.add(i.toLowerCase()))
      //Get Amount of Locks on Contract
      const { output: totalLocks } = await sdk.api.abi.call({
        target: lockContract,
        abi: getLockCountPerContractV3,
        chain,
        block,
      });

      const walletIdCalls = []
      let j = cCache.lastTotalLocks || 0
      cCache.lastTotalLocks = +totalLocks
      for (; j < +totalLocks; j++)
        walletIdCalls.push({ params: [j] })
      const { output: walletIdsAll } = await sdk.api.abi.multiCall({
        target: lockContract,
        abi: getLockerWalletWithIdV3,
        calls: walletIdCalls,
        chain, block,
      })

      walletIdsAll.forEach(({ output }) => walletIdSet.add(output.toLowerCase()))

      cCache.walletIds = [...walletIdSet]
      const walletLockCountCalls = cCache.walletIds.map(i => ({ params: i }))
      const { output: countRes } = await sdk.api.abi.multiCall({
        target: lockContract,
        abi: getLockerPerWalletV3,
        calls: walletLockCountCalls,
        chain, block,
      })

      const calls = []
      cCache.walletIds.forEach((wallet, i) => {
        if (!wCache[wallet]) wCache[wallet] = {}
        let j = wCache[wallet].lastCount || 0
        cCache.lastCount = +countRes[i].output
        for (; j < +countRes[i].output; j++)
          calls.push({ params: [wallet, j] })
      })

      const { output: returnFromDataStruct } = await sdk.api.abi.multiCall({
        target: lockContract,
        abi: getLockerLPDataV3,
        calls, chain, block,
      })

      const tokenSet = new Set()
      cCache.tokens.forEach(i => tokenSet.add(i.toLowerCase()))

      returnFromDataStruct.forEach(({ output, success }) => {
        if (!success || !output.lpAddress) return;
        tokenSet.add(output.lpAddress.toLowerCase())
      })
      cCache.tokens = [...tokenSet]
      const tempBalances = await vestingHelper({ cache, useDefaultCoreAssets: true, owner: lockContract, tokens: cCache.tokens, chain, block, })

      Object.entries(tempBalances).forEach(([token, bal]) => sdk.util.sumSingleBalance(balances, token, bal))
    }

    async function addV3Lps() {
      //Get Liquidity Locks new from storage
      if (!cache.v3Contracts) cache.v3Contracts = {}

      for (let i = 0; i < args.storageLiquidityLocks.length; i++) {
        const contract = args.storageLiquidityLocks[i]
        if (!cache.v3Contracts[contract]) cache.v3Contracts[contract] = {}
        const cCache = cache.v3Contracts[contract]
        //Get Amount of Locks on Contract
        const { output: totalLocks } = await sdk.api.abi.call({
          target: contract,
          abi: getStorageLockCountV33,
          chain,
          block,
        })

        const calls = []
        let j = cCache.lastTotalLocks || 0
        cCache.lastTotalLocks = +totalLocks
        for (; j < +totalLocks; j++)
          calls.push({ params: [j] })

        const { output: lpData } = await sdk.api.abi.multiCall({
          target: contract,
          abi: getStorageLPLockDataV33,
          calls, chain, block,
        })

        lpData.forEach(({ output: { lockedLPTokens, lpLockContract } }) => cache.v3LPData.push([lockedLPTokens, lpLockContract]))
      }

      const tempBalances = await sumUnknownTokens({ chain, block, tokensAndOwners: cache.v3LPData, useDefaultCoreAssets: true, cache, })

      Object.entries(tempBalances).forEach(([token, bal]) => sdk.util.sumSingleBalance(balances, token, bal))
    }
  };
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getTVLTotal(config[chain]) }
})

module.exports.dexit.tvl = () => ({})
