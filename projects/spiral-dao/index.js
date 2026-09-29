const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk');
const abi = {
    "poolCount": "function poolCount() external view returns (uint256)",
    "poolInfo": "function poolInfo(uint256 poolId) external view returns (tuple(address target, address adapter, uint256 targetPoolId, uint256 rewardableDeposits) memory)",
    "lockableToken": "function lockableToken(uint256) external view returns (address)"
  };

const MASTERMIND = "0xFACE8DED582816E2f2cD4C6cc1cbD1aCCc9df65E"
const STAKING = "0x6701e792b7cd344bae763f27099eeb314a4b4943"
const COIL = '0x823E1B82cE1Dc147Bbdb25a203f046aFab1CE918'

async function tvl(api) {
  const balances = {}
  let pools = await api.fetchList({ target: MASTERMIND, itemAbi: abi.poolInfo, lengthAbi: abi.poolCount, })
  let poolInputs = await api.fetchList({ target: MASTERMIND, itemAbi: abi.lockableToken, lengthAbi: abi.poolCount, })
  for (let i = 0; i < pools.length; i++) {
    await sdk.util.sumSingleBalance(balances, poolInputs[i], pools[i].rewardableDeposits)
  }
  return balances;
}


module.exports = {
  methodology: 'Information is retrieved from both the blockchain and the SpiralDAO API. "https://api.spiral.farm".',
  ethereum: {
    tvl,
    staking: staking(STAKING, COIL),
  }
};

