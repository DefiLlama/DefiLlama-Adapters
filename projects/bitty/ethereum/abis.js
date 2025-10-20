module.exports = {
  UiPoolDataProvider: {
    getSimpleReservesData: "function getSimpleReservesData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, uint256 decimals, uint256 reserveFactor, bool borrowingEnabled, bool isActive, bool isFrozen, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint40 lastUpdateTimestamp, address bTokenAddress, address debtTokenAddress, address interestRateAddress, uint256 availableLiquidity, uint256 totalVariableDebt, uint256 priceInEth, uint256 variableRateSlope1, uint256 variableRateSlope2)[])"
  },
  BNFTRegistry: {
    getBNFTAssetList: "function getBNFTAssetList() external view returns (address[] memory)",
    bNftProxys: "function bNftProxys(address) view returns (address)"
  },
};
