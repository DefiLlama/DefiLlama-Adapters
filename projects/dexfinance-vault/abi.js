exports.abi = {
  factory: {
    vaultsLength: "function vaultsCount() view returns (uint256)",
    vaults: "function vaults(uint256 index) view returns (address)",
    farmCalculationConnector:
      "function farmCalculationConnector(address) view returns (address)",
  },
  vault: {
    liquidity: "function liquidity(address) view returns (uint256 liquidity_)",
    farmsLength: "uint256:farmsCount",
    farmConnector: "function farmConnector(address) view returns (address)",
    farms:
      "function farms(uint256 index) view returns (tuple(address beacon, uint256 percent, bytes data))",
  },
  farm: {
    stakingToken: "function stakingToken() view returns (address)",
    farm: "address:farm",
    pid: "uint256:pid",
    type: "string:stakingTokenType",
    version: "uint256:dexVersion",
    tokenId: "uint256:tokenId",
  },
  lpv2: {
    lpReservesAbi:
      "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
    lpSuppliesAbi: "uint256:totalSupply",
    token0Abi: "address:token0",
    token1Abi: "address:token1",
  },
};
