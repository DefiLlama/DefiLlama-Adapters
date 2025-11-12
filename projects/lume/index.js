const { masterchefExports } = require('../helper/unknownTokens')
const { mergeExports } = require("../helper/utils")

module.exports = mergeExports([
  masterchefExports({
    chain: 'cronos',
    masterchef: '0xF3cCE1bCe378B56BA24Cf661E2bA128303DD8b88',
    nativeToken: '0xB3551aCf805D5F90A1Fd7444B6571BdC069F40b2',
    poolInfoABI: 'function getPoolInfo(uint256 _pid) external view returns (address lpToken, uint256 _allocPoint)'
  }),
  masterchefExports({
    chain: 'cronos',
    masterchef: '0x21dFe774C313AA92392725ac51693E26072c8099',
    nativeToken: '0x6d810420Fcee6478cE73d4f466A094BBAdE11dA6',
    poolInfoABI: 'function poolInfo(uint256 _pid) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accNovaPerShare, bool isStarted)'
  })
])
