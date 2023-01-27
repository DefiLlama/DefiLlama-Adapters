const getStorageLPLockDataV33 ='function AllLockRecord(uint256) view returns (uint256 createdOn, address lockOwner, address lockedLPTokens, uint256 lockTime, address lpLockContract, bool locked, string logo, uint256 lockedAmount, uint256 countID, bool exists, address token0Addr, address token1Addr)'
const getStorageLockCountV33 = "uint256:lockerIDCount";
const getLockCountPerContractV3 = "uint256:lockerNumberOpen"
const getLockerWalletWithIdV3 = 'function LockerRecord(uint256) view returns (address)';
const getLockerLPDataV3 = 'function DXLOCKERLP(address, uint256) view returns (bool exists, bool locked, string logo, uint256 lockedAmount, uint256 lockedTime, uint256 startTime, address lpAddress)';
const getLockerPerWalletV3 = 'function UserLockerCount(address) view returns (uint256)';

module.exports = {
  getStorageLPLockDataV33,
  getLockCountPerContractV3,
  getLockerPerWalletV3,
  getLockerWalletWithIdV3,
  getLockerLPDataV3,
  getStorageLockCountV33,
};
