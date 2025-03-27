const { masterchefExports } = require('../helper/unknownTokens')

const standardPoolInfoAbi = 'function getPoolInfo(uint256 _pid) external view returns (address lpToken, uint256 _allocPoint)'

module.exports = masterchefExports({
  chain: 'sonic',
  masterchef: '0x5F59CABC5b6BB9B391a033d712afA1b1D90CE62B',
  nativeToken: '0xB144E5f84BbA5b2b4Ea2fBa9d7364E8990FC7216',
  poolInfoABI: standardPoolInfoAbi
})
