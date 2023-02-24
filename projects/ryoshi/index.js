const { masterchefExports } = require('../helper/unknownTokens')
const wDoge = '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101'
const nullAddress = '0x0000000000000000000000000000000000000000'


module.exports = masterchefExports({
  chain: 'dogechain',
  masterchef: '0x206949295503c4FC5C9757099db479dD5383A5dC',
  nativeTokens: ['0xa4F9877A08F7639df15D506eAFF92Ab5E78273cd', '0xa98fa09D0BED62A9e0Fb2E58635b7C9274160dc7', ],
  useDefaultCoreAssets: true,
  poolLengthAbi:  "uint256:poolCounter",
  poolInfoABI: 'function pools(uint256) view returns (address stakingToken, address rewardsToken, uint256 duration, uint256 finishAt, uint256 updatedAt, uint256 rewardRate, uint256 rewardPerTokenStored, uint256 totalSupply)',
  getToken: i => i.stakingToken === nullAddress ? wDoge : i.stakingToken,
})