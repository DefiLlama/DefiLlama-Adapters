const DHEDGE_FACTORY_ABI = 'function getManagedPools(address manager) view returns (address[] managedPools)';

const TOROS_POOL_ABI = 'function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue, address manager, string managerName, uint256 creationTime, bool privatePool, uint256 performanceFeeNumerator, uint256 managerFeeNumerator, uint256 managerFeeDenominator, uint256 exitFeeNumerator, uint256 exitFeeDenominator))'

module.exports = {
  DHEDGE_FACTORY_ABI,
  TOROS_POOL_ABI,
};
