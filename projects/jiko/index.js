const STAKING_CONTRACT = "0xE87F64e1F5dA6F197Dc8f2a2449687010117E1d8"
const abi = {
  getPools: 'function getPools() view returns (tuple(tuple(uint256 id, address stakingToken, uint256 totalStaked, uint256 stLocked, uint256 totalDebt, uint256 totalShares, uint256 totalSharesLocked, uint256 aSugarDailyRoi, uint256 stPrice, bool isActive) pool, tuple(uint256 idx, uint256 duration, uint256 leverage, uint256 tokenFeeRate)[] locks, tuple(uint256 idx, address rewardToken, uint256 duration, uint256 finishAt, uint256 updatedAt, uint256 rewardRate, uint256 rewardPerShareStored, uint256 balance, bool onlyLocked)[] rewards)[])',
}

async function tvl(api) {
    // Get all pools in the protocol
    const poolViews = await api.call({ 
        target: STAKING_CONTRACT, 
        abi: abi.getPools
    })

    // Extract pool data
    for (const poolView of poolViews) {
        api.add(poolView.pool.stakingToken, poolView.pool.totalStaked)
    } 
}

module.exports = {
    methodology: "TVL includes all tokens staked in active pools. Uses totalStaked from each pool struct.",
    berachain: {
        tvl
    },
}