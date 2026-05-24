
const abi = {
  totalAssetsInAssetA:
    "function totalAssetsInAssetA() view returns (uint256)",
  getTotalValueInA:  
    "function getTotalValueInA() view returns (uint256 totalInA)",
  getNextBotId: 
    "function getNextBotId() external view returns (uint32)",
  traderBots: 
    "function traderBots(uint32 _id) external view returns (address)",
  getCurrentDeposits: 
    "function getCurrentDeposits(bool isBuy) public view returns (uint256 currentDeposits)"
};

module.exports = {
  abi,
}