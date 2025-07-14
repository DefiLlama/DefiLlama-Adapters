const erc4626Abi = {
  'asset': 'function asset() external view returns (address)',
}

const fortyAcresAbi = {
  'vault': 'function _vault() public view returns (address)',
  'activeAssets': 'function activeAssets() public view returns (uint256)'
}


module.exports = {
  erc4626Abi,
  fortyAcresAbi
}
