exports.abi = {
  factory: {
    vaultsLength: "function vaultsCount() view returns (uint256)",
    vaults: "function vaults(uint256 index) view returns (address)",
    farmCalculationConnector:
      "function farmCalculationConnector(address) view returns (address)",
  },
  vault: {
    farmsLength: "uint256:farmsCount",
    farms:
      "function farms(uint256 index) view returns (tuple(address beacon, uint256 percent, bytes data))",
  },
  farm: {
    stakingToken: "function stakingToken() view returns (address)",
    tokenId: "function tokenId() view returns (uint256)",
    pool: "address:pool",
    farm: "address:farm",
    pid: "uint256:pid",
  },
};
