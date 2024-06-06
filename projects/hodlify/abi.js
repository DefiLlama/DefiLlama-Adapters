const erc4626Abi = {
    'asset': 'function asset() external view returns (address)',
    'totalAssets': 'function totalAssets() public view returns (uint256)'
}

const stargateLpStakingAbi = {
    'userInfo': 'function userInfo( uint256 ,address  ) external view returns (uint256 amount, uint256 rewardDebt)',
}

const stargatePoolAbi = {
    'amountLPtoLD': 'function amountLPtoLD(uint256 _amountLP) external view returns (uint256)',
    'token': 'function token() external view returns (address)',
}

module.exports = {
    erc4626Abi,
    stargateLpStakingAbi,
    stargatePoolAbi,
}