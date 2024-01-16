const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const ADDRESSES = require("../helper/coreAssets.json");
const { getCurrentBlocks } = require('@defillama/sdk/build/util/blocks');

const registryContract = '0x2e051a657014024f3e6099fbf3931f8dc14ef0f8';
const stWemixContract  = '0x9B377bd7Db130E8bD2f3641E0E161cB613DA93De';
const ncpStakingContract = '0x6Af09e1A3c886dd8560bf4Cabd65dB16Ea2724D8';
const grandStakingContract = '0x6F3f44B0Cf7C751f2a44Faf6bFdd08e499Eb0973';
const wwemix = ADDRESSES.wemix.WWEMIX;
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

async function tvl(timestamp, block, chainBlocks) {
  // need to delete
  block = 'latest';

  // get Staking Contract address
  const wonderStakingContract = (
    await sdk.api.abi.call({
      target: registryContract,
      params: Staking,
      abi: abi['getContractAddress'],
      block,
      chain: 'wemix'
    })
  ).output
  sdk.log('wonderStakingContract:', wonderStakingContract)

  // get Governance Contact address
  const govContract = (
    await sdk.api.abi.call({
      target: registryContract,
      params: Governance,
      abi: abi['getContractAddress'],
      block,
      chain: 'wemix'
    })
  ).output
  sdk.log('govContract:', govContract);

  // get the number of NCP members
  const nMembers = (
    await sdk.api.abi.call({
      target: govContract,
      abi: abi['getMemberLength'],
      block,
      chain: 'wemix'
    })
  ).output
  sdk.log('No of NCP members: ', nMembers);

  const memberIndices = Array.from(Array(parseInt(nMembers)).keys());
  const memberCalls = memberIndices.map(i => ({
    target: govContract,
    params: i+1
  }));

  // get member list
  const members = (
    await sdk.api.abi.multiCall({
      calls: memberCalls,
      abi: abi['getMember'],
      block,
      chain: 'wemix'
    })
  ).output;

  // Get user staking balances from Wonder Staking
  async function getBalances() {
    let stakingTotal = new BigNumber(0);
    for (const member of members) {
      const balance = await sdk.api.abi.call({
        target: wonderStakingContract,
        params: member['output'],
        abi: abi['userTotalBalanceOf'],
        block,
        chain: 'wemix'
      });
      stakingTotal = stakingTotal.plus(new BigNumber(balance['output']));
      sdk.log('member:', member['output'], ', balance:', balance['output']);
    }
    return stakingTotal;
  }
  const wonderStakingUsersBalances = await getBalances();

  // Get Liquid Staking PID
  const stWemixPid = (
    await sdk.api.abi.call({
      target: stWemixContract,
      abi: abi['pid'],
      block,
      chain: 'wemix'
    })
  ).output;

  // Get Liquid Staking Amount
  const stWemixInfo = (
    await sdk.api.abi.call({
      target: ncpStakingContract,
      params: [new BigNumber(stWemixPid).toString(), stWemixContract],
      abi: abi['getUserInfo'],
      block,
      chain: 'wemix'
    })
  ).output;

  // Sub Liquid staking from Wonder Straking
  const wonderUserStakingAmount = wonderStakingUsersBalances - stWemixInfo['amount'];

  // Get Grand Staking Amount
  const grandInfo = (
    await sdk.api.abi.call({
      target: grandStakingContract,
      params: 0,
      abi: abi['getPoolInfo'],
      block,
      chain: 'wemix'
    })
  ).output;
  const grandAmount = grandInfo['totalDeposit'];

  // Get DIOS Staking Amount
  const diosInfo = (
    await sdk.api.abi.call({
      target: grandStakingContract,
      params: 1,
      abi: abi['getPoolInfo'],
      block,
      chain: 'wemix'
    })
  ).output;
  const diosAmount = diosInfo['totalDeposit'];

  const balances = {};
  sdk.util.sumSingleBalance(balances, wemix, wonderUserStakingAmount, 'wemix');
  sdk.util.sumSingleBalance(balances, wemix, grandAmount, 'wemix');
  sdk.util.sumSingleBalance(balances, wemix, diosAmount, 'wemix');
  return balances;
}

module.exports = {
  hallmarks: [
    [1687478400,"WONDER Staking Live"]
  ],
  wemix: {
    tvl
  },
};