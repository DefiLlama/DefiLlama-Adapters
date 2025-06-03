const STAKING_CONTRACT = "0xE87F64e1F5dA6F197Dc8f2a2449687010117E1d8"
const NFT_STAKING_CONTRACT = "0x05113720A7AbC229124b8682DFDB2521E49608C4"
const PRECISION = 6

const abi = {
  getPools: 'function getPools() view returns (tuple(tuple(uint256 id, address stakingToken, uint256 totalStaked, uint256 stLocked, uint256 totalDebt, uint256 totalShares, uint256 totalSharesLocked, uint256 aSugarDailyRoi, uint256 stPrice, bool isActive) pool, tuple(uint256 idx, uint256 duration, uint256 leverage, uint256 tokenFeeRate)[] locks, tuple(uint256 idx, address rewardToken, uint256 duration, uint256 finishAt, uint256 updatedAt, uint256 rewardRate, uint256 rewardPerShareStored, uint256 balance, bool onlyLocked)[] rewards)[])',
  getNftPools: 'function getPools() view returns (tuple(uint256 id, address nftAddress, address lpToken, bool isActive, uint256 amountStaked)[])'
}

async function tvl(api) {
    // Get all pools in the protocol
    const poolViews = await api.call({ 
        target: STAKING_CONTRACT, 
        abi: abi.getPools
    })

    const nftPools = await api.call({ 
        target: NFT_STAKING_CONTRACT, 
        abi: abi.getNftPools
    })

    // Calculate TVL for regular nft staking pools
    const poolViewsWithNft = poolViews.filter(p => nftPools.some(np =>  np.lpToken.toLowerCase() === p.pool.stakingToken.toLowerCase()))
    const tvlNftStaking = poolViewsWithNft.reduce((acc, p) =>  acc + (p.pool.totalStaked / 10 ** PRECISION) * p.pool.stPrice, 0)
    api.addUSDValue(Number(tvlNftStaking) / 10 ** 18)

    for (const poolView of poolViews) {
        api.add(poolView.pool.stakingToken, poolView.pool.totalStaked)
    } 
}

module.exports = {
    berachain: {
        tvl
    },
}