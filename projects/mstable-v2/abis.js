const DHEDGE_FACTORY_ABI =
    "function getManagedPools(address manager) view returns (address[] managedPools)";

const DHEDGE_POOL_LOGIC_ABI =
    "function poolManagerLogic() view returns (address)";

const MSTABLE_POOL_MANAGER_LOGIC_ABI =
    "function getFundComposition() view returns (tuple(address asset, bool isDeposit)[] assets, uint256[] balances)";

module.exports = {
  DHEDGE_FACTORY_ABI,
  DHEDGE_POOL_LOGIC_ABI,
  MSTABLE_POOL_MANAGER_LOGIC_ABI,
};
