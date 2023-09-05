
const lpLockerCount = 'function lpLockerCount() view returns (uint40)'
const tokenLockerCount = 'function tokenLockerCount() view returns (uint40)'
const getLpData = `function getLpData(uint40 id_) view returns 
(
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
)`
const getLpLockAddress = 'function getLpLockAddress(uint40 id_) view returns (address)'
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
const getTokenLockAddress = 'function getTokenLockAddress(uint40 id_) view returns (address)'
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
const getPair = `function getPair(address tokenA, address tokenB) view returns (address pair)`

module.exports = {
    lpLockerCount,
    tokenLockerCount,
    getLpData,
    getLpLockAddress,
    getLpLockData,
    getTokenLockAddress,
    getTokenLockData,
    getPair
}