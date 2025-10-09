const POOL_PROXY_CONTRACT = "0x4F77497A0f6A8f1C9d577d7E29d4525C8CCC9c8B"
const abi = {
  getPools: 'function getAllPools() view returns (tuple(uint128 id, address owner, address stakingToken, address stakingNft, uint256 totalInvested, bool hasLPT, uint256 aSugarDailyRoi, uint256 stPrice, uint256 maxStakedAmount, bool isActive, uint256 liquidationThreshold, uint256 liquidationDelay)[])',
  getLocks: 'function getLocksByPool(uint128 _poolId) view returns (tuple(uint256 id, uint128 poolId, uint256 duration, uint256 leverage, uint256 totalShares, uint256 totalStaked, uint8 status)[])',
}

async function tvl(api) {
    // Get all pools in the protocol
    const pools = await api.call({ 
        target: POOL_PROXY_CONTRACT, 
        abi: abi.getPools
    })

    // Filter active pools
    const activePools = pools.filter(pool => pool.isActive)
    
    // Use multicall to get all locks at once
    const allLocks = await api.multiCall({
        target: POOL_PROXY_CONTRACT,
        abi: abi.getLocks,
        calls: activePools.map(pool => ({ params: [pool.id] }))
    })

    // Process locks and sum totalStaked
    activePools.forEach((pool, index) => {
        const locks = allLocks[index]
        if (locks.length === 0) return; // Skip pools with no locks

        // Sum totalStaked from all locks in the pool
        for (const lock of locks) {
            api.add(pool.stakingToken, lock.totalStaked)
        }
    })
}

module.exports = {
    methodology: "TVL includes all tokens staked in active pools. Uses totalStaked from each pool struct.",
    berachain: {
        tvl
    },
}