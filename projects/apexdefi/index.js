const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json');

const config = {
  avax: { factory: "0x3D193de151F8e4e3cE1C4CB2977F806663106A87", },
  base: { factory: "0x4ccf7aa5736c5e8b6da5234d1014b5019f50cb56", },
  ethereum: { factory: "0x820c889D5749847217599B43ab86FcC91781019f", },
}

async function _staking(api) {
  const poolInfoAbi = "function getPoolInfo(uint256 _poolId) public view returns (address _staketoken, uint256 _allocationPoints, uint256 _lastRewardTimestamp, uint256 _rewardTokenPerShare, uint256 _totalStaked, uint256 _bonusMultiplier, address _rewarder)"

  const poolInfo = await api.fetchList({ lengthAbi: 'poolLength', itemAbi: poolInfoAbi, target: '0x5995876c9C6e2C23C1C5fc902661127fF9ed38D3', })
  poolInfo.forEach(pool => api.add(pool._staketoken, pool._totalStaked))
}

module.exports.methodology = "The Apex DeFi factory contract address is used to obtain the balances held in each token contract as liquidity and the staking contract is used to get the staked APEX balance.";

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({ abi: 'address[]:getAllTokens', target: factory })
      return api.sumTokens({ owners: tokens, tokens: [ADDRESSES.null] })
    }
  }
})

// module.exports.avax.staking = staking('0x5995876c9C6e2C23C1C5fc902661127fF9ed38D3','0x98B172A09102869adD73116FC92A0A60BFF4778F')