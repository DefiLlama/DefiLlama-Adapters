
const getNumLockedTokens = "uint256:getNumLockedTokens"
const lockedTokensLength = "uint256:lockedTokensLength"
const getLockedTokenAtIndex =  'function getLockedTokenAtIndex(uint256 _index) view returns (address)'
const lockedToken = 'function lockedTokens(uint256) view returns (address)'

module.exports = {
  getLockedTokenAtIndex,
  getNumLockedTokens,
  lockedTokensLength,
  lockedToken
}