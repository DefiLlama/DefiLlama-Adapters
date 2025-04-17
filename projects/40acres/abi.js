const erc4626Abi = {
  'asset': 'function asset() external view returns (address)',
  'totalAssets': 'function totalAssets() public view returns (uint256)',
  'epochRewardsLocked': 'function epochRewardsLocked() public view returns (uint256)'
}

const fortyAcresAbi = {
  'vault': 'function _vault() public view returns (address)'
}


module.exports = {
  erc4626Abi,
  fortyAcresAbi
}
