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
const { sumUnknownTokens, vestingHelper, } = require("../helper/unknownTokens");
const { createIncrementArray, } = require("../helper/utils");

function getTVLTotal(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    const chain = args.chain;
    const block = chainBlocks[chain];

    const tokensAndOwners = []

    await addV3Lps()

    //Get Locks from Archives
    for (const lock of args.locks)
      await addlockLPs(lock)

    return balances;

    async function addlockLPs(lockContract) {
      const walletIdSet = new Set()
      //Get Amount of Locks on Contract
      const { output: totalLocks } = await sdk.api.abi.call({
        target: lockContract,
        abi: getLockCountPerContractV3,
        chain,
        block,
      });
      const walletIdCalls = createIncrementArray(totalLocks).map(i => ({ params: [i] }))
      const { output: walletIdsAll } = await sdk.api.abi.multiCall({
        target: lockContract,
        abi: getLockerWalletWithIdV3,
        calls: walletIdCalls,
        chain, block,
      })

      walletIdsAll.forEach(({ output }) => walletIdSet.add(output))

      const walletIds = [...walletIdSet]
      const walletLockCountCalls = walletIds.map(i => ({ params: i }))
      const { output: countRes } = await sdk.api.abi.multiCall({
        target: lockContract,
        abi: getLockerPerWalletV3,
        calls: walletLockCountCalls,
        chain, block,
      })

      const calls = walletIds.map((wallet, i) => {
        return createIncrementArray(countRes[i].output).map(j => ({ params: [wallet, j] }))
      }).flat()

      const { output: returnFromDataStruct } = await sdk.api.abi.multiCall({
        target: lockContract,
        abi: getLockerLPDataV3,
        calls, chain, block,
      })

      const tokenSet = new Set()

      returnFromDataStruct.forEach(({ output, success }) => {
        if (!success || !output.lpAddress) return;
        tokenSet.add(output.lpAddress)
      })

      const tempBalances = await vestingHelper({ useDefaultCoreAssets: true, owner: lockContract, tokens: [...tokenSet], chain, block, })

      Object.entries(tempBalances).forEach(([token, bal]) => sdk.util.sumSingleBalance(balances, token, bal))
    }

    async function addV3Lps() {
      //Get Liquidity Locks new from storage
      for (let i = 0; i < args.storageLiquidityLocks.length; i++) {
        //Get Amount of Locks on Contract
        const { output: totalLocks } = await sdk.api.abi.call({
          target: args.storageLiquidityLocks[i],
          abi: getStorageLockCountV33,
          chain,
          block,
        })

        const calls = createIncrementArray(totalLocks).map(i => ({ params: [i] }))
        const { output: lpData } = await sdk.api.abi.multiCall({
          target: args.storageLiquidityLocks[i],
          abi: getStorageLPLockDataV33,
          calls,
          chain, block,
        })

        lpData.forEach(({ output: { lockedLPTokens, lpLockContract } }) => tokensAndOwners.push([lockedLPTokens, lpLockContract]))
      }

      const tempBalances = await sumUnknownTokens({ chain, block, tokensAndOwners, useDefaultCoreAssets: true, })

      Object.entries(tempBalances).forEach(([token, bal]) => sdk.util.sumSingleBalance(balances, token, bal))
    }
  };
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getTVLTotal(config[chain]) }
})

module.exports.dexit.tvl = () => ({})
module.exports.milkomeda.tvl = () => ({})