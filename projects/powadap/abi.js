const { get } = require("../helper/http");

module.exports = {
  //Lockers
  getTotalLockCount: "uint256:getTotalLockCount",
  getLockAt: "function getLockAt(uint256 index) view returns (tuple(uint256 id, address token, address owner, uint256 amount, uint256 lockDate, uint256 tgeDate, uint256 tgeBps, uint256 cycle, uint256 cycleBps, uint256 unlockedAmount, string description))",
}