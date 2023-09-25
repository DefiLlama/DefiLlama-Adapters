const camelotMasterAbi = {
    "poolLength": 'function poolsLength() view returns (uint256)',
    "getPoolAddressByIndex": "function getPoolAddressByIndex(uint256 index) view returns (address)",
    "getPoolInfo": "function getPoolInfo(address) view returns (address poolAddress, uint256 allocPoint, uint256 lastRewardTime, uint256 reserve, uint256 poolEmissionRate)",
}

const camelotNFTPoolAbi = {
    "balanceOf": "function balanceOf(address owner) view returns (uint256 balance)",
    "tokenOfOwnerByIndex": "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "getPoolInfo": "function getPoolInfo() view returns (address lpToken, address grailToken, address xGrailToken, uint256 lastRewardTime, uint256 accRewardsPerShare, uint256 lpSupply, uint256 lpSupplyWithMultiplier, uint256 allocPoint)",
    "getStakingPosition" : "function getStakingPosition(uint256 tokenId) view returns (uint256 amount, uint256 amountWithMultiplier, uint256 startLockTime, uint256 lockDuration, uint256 lockMultiplier, uint256 rewardDebt, uint256 boostPoints, uint256 totalMultiplier)"
}

const camelotNitroPoolAbi = {
    "nftPool": "function nftPool() view returns (address)",
    "userInfo": "function userInfo(address) view returns (uint256 totalDepositAmount, uint256 rewardDebtToken1, uint256 rewardDebtToken2, uint256 pendingRewardsToken1, uint256 pendingRewardsToken2)"
}

const wCamelotSpNFTAbi = {
    "stakedNitroPool": "function stakedNitroPool(uint256) view returns (address stakedNitroPool)",
}


module.exports = {
    camelotMasterAbi,
    camelotNFTPoolAbi,
    camelotNitroPoolAbi,
    wCamelotSpNFTAbi,
}