const ADDRESSES = require("../helper/coreAssets.json");

const registryContract = '0x2e051a657014024f3e6099fbf3931f8dc14ef0f8';
const stWemixContract = '0x9B377bd7Db130E8bD2f3641E0E161cB613DA93De';
const ncpStakingContract = '0x6Af09e1A3c886dd8560bf4Cabd65dB16Ea2724D8';
const grandStakingContract = '0x6F3f44B0Cf7C751f2a44Faf6bFdd08e499Eb0973';
const wemix = ADDRESSES.null;
const Staking = '0x5374616b696e6700000000000000000000000000000000000000000000000000';
const Governance = '0x476f7665726e616e6365436f6e74726163740000000000000000000000000000';

const abi = {
  getContractAddress: 'function getContractAddress(bytes32 _name) public view returns (address addr)',
  getMember: 'function getMember(uint256) external view returns (address)',
  getMemberLength: 'function getMemberLength() external view returns (uint256)',
  userTotalBalanceOf: 'function userTotalBalanceOf(address ncp) external view returns (uint256)',
  pid: 'function pid() external view returns (uint256)',
  getUserInfo: 'function getUserInfo(uint256 pid, address account) external view returns (tuple(uint256 amount, uint256 rewardDept, uint256 pendingReward, uint256 pendingAmountReward, uint256 lastRewardClaimed) memory info)',
  getPoolInfo: 'function getPoolInfo(uint256 pid) external view returns (tuple(uint256 accRewardPerShare, uint256 accMPPerShare, uint256 lastRewardBlock, uint256 totalDeposit, uint256 totalMP, address rewardToken, bool isInputNative, bool isRewardNative, bool activatedMP, bool lock, address[] path, address breaker, address breakerSetter) memory info)'
}

async function tvl(api) {
  const wonderStakingContract = await api.call({ abi: abi.getContractAddress, target: registryContract, params: Staking })
  const govContract = await api.call({ abi: abi.getContractAddress, target: registryContract, params: Governance })
  const members = await api.fetchList({ lengthAbi: abi.getMemberLength, itemAbi: abi.getMember, target: govContract, startFromOne: true })
  const bals = await api.multiCall({  abi: abi.userTotalBalanceOf, calls: members, target: wonderStakingContract })
  api.add(wemix, bals)
  const pid = await api.call({  abi: abi.pid, target: stWemixContract })
  // Get Liquid Staking Amount
  const wemixInfo = await api.call({  abi: abi.getUserInfo, target: ncpStakingContract, params: [pid, stWemixContract] })
  // Sub Liquid staking from Wonder Straking
  api.add(wemix, wemixInfo['amount'] * -1);

  const grandInfo= await api.call({  abi: abi.getPoolInfo, target: grandStakingContract, params: 0 })
  const diosInfo = await api.call({  abi: abi.getPoolInfo, target: grandStakingContract, params: 1 })
  api.add(wemix, grandInfo.totalDeposit)
  api.add(wemix, diosInfo.totalDeposit)
}

module.exports = {
  hallmarks: [
    [1687478400, "WONDER Staking Live"]
  ],
  wemix: {
    tvl
  },
};