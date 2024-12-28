module.exports = {
    abi: {
        getAccruedBalance: "function getAccruedBalance() view returns (uint256 totalCollateralPayFixed, uint256 totalCollateralReceiveFixed, uint256 liquidityPool, uint256 vault)",
        getAmmBalance: "function getAmmBalance(address asset) view returns (uint256 totalCollateralPayFixed, uint256 totalCollateralReceiveFixed, uint256 liquidityPool, uint256 vault)",
        getBalancesForOpenSwap: " function getBalancesForOpenSwap(address asset) external view returns (uint256 totalCollateralPayFixed, uint256 totalNotionalPayFixed, uint256 totalCollateralReceiveFixed, uint256 totalNotionalReceiveFixed, uint256 liquidityPool)",
        getAsset: "address:getAsset",
      }
};
