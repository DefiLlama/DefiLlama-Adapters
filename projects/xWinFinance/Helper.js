const token = {
  XWIN: '0xd88ca08d8eec1e9e09562213ae83a7853ebb5d28'
};

const farms = {
  MasterChefAddress: "0xD09774e3d5Dc02fa969896c53D3Cbb5bC8900A60",
  BuddyChefAddress: "0x4B87a60fC5a94e5ac886867977e29c9711C2E903",
  LockStakingAddress: "0xa4AE0DCC89Af9855946C0b2ad4A10FF27125a9Fc",
  PriceMasterAddr: "0xB1233713FeA0984fff84c7456d2cCed43e5e48E2",
};

const abi = {
  getVaultValues:
    "function getVaultValuesInUSD() public view returns (uint vaultValue)",
  poolLength: "function poolLength() view returns (uint)",
  poolInfoMaster:
    "function poolInfo(uint256) view returns (address, uint256, uint256, uint256, uint256, uint256)",
  balance: "function balanceOf(address) view returns (uint256)",
  decimals: "function decimals() view returns (uint8)",
  getPrice: "function getPrice(address, address) view returns (uint rate)",
};

module.exports = {
  farms,
  abi,
  token,
}