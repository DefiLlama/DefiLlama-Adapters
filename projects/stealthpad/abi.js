
const lpLockerCount = 'function lpLockerCount() view returns (uint40)'
const tokenLockerCount = 'function tokenLockerCount() view returns (uint40)'

const getLpLockData = `function getLpLockData(uint40 id_) view returns 
(
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 blockTime,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
)`
const getTokenLockData = `function getTokenLockData(uint40 id_) view returns 
(
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 blockTime,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
)`

module.exports = {
    lpLockerCount,
    tokenLockerCount,
    getLpLockData,
    getTokenLockData,
}