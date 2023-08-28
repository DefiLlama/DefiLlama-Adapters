const ADDRESSES = require('../helper/coreAssets.json')
const { masterchefExports } = require('../helper/unknownTokens')
const wDoge = ADDRESSES.dogechain.WWDOGE
const nullAddress = ADDRESSES.null


module.exports = masterchefExports({
  chain: 'dogechain',
  masterchef: '0x206949295503c4FC5C9757099db479dD5383A5dC',
  nativeTokens: ['0xa4F9877A08F7639df15D506eAFF92Ab5E78273cd', '0xa98fa09D0BED62A9e0Fb2E58635b7C9274160dc7', ],
  useDefaultCoreAssets: true,
  poolLengthAbi:  "uint256:poolCounter",
  poolInfoABI: 'function pools(uint256) view returns (address stakingToken, address rewardsToken, uint256 duration, uint256 finishAt, uint256 updatedAt, uint256 rewardRate, uint256 rewardPerTokenStored, uint256 totalSupply)',
  getToken: i => i.stakingToken === nullAddress ? wDoge : i.stakingToken,
})