module.exports = {
    allLendingPools: "function allLendingPools(uint256) view returns (address)",
    allLendingPoolsLength: "uint256:allLendingPoolsLength",
    getLendingPool: "function getLendingPool(address) view returns (bool initialized, uint24 lendingPoolId, address collateral, address borrowable0, address borrowable1)",
    underlying: "address:underlying",
    totalBorrows: "function totalBorrows() view returns (uint112)",
  }
  