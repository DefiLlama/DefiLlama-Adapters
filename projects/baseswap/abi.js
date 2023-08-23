module.exports = {
    depositsCount: "function depositsCount() view returns (uint256)",
    lockedToken: "function lockedToken(uint256) view returns (address token,address withdrawer,uint256 amount,uint256 unlockTimestamp,bool withdrawn)"
};