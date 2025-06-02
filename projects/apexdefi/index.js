const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json');

const config = {
  avax: { factory: "0x754A0c42C35562eE7a41eb824d14bc1259820f01", wrapperFactory: '0x39aB4aabAd7656f94E32ebD90547C3c4a183f4B4' },
  base: { factory: "0x10d11Eb1d5aB87E65518458F990311480b321061", wrapperFactory: '0xc9fbf1e865eeababe92d47ddb11d580f37ce4e00' },
  ethereum: { factory: "0x820c889D5749847217599B43ab86FcC91781019f", },
}

async function _staking(api) {
  const poolInfoAbi = "function getPoolInfo(uint256 _poolId) public view returns (address _staketoken, uint256 _allocationPoints, uint256 _lastRewardTimestamp, uint256 _rewardTokenPerShare, uint256 _totalStaked, uint256 _bonusMultiplier, address _rewarder)"

  const poolInfo = await api.fetchList({ lengthAbi: 'poolLength', itemAbi: poolInfoAbi, target: '0x5995876c9C6e2C23C1C5fc902661127fF9ed38D3', })
  poolInfo.forEach(pool => api.add(pool._staketoken, pool._totalStaked))
}

module.exports.methodology = "The Apex DeFi factory contract address is used to obtain the balances held in each token contract as liquidity and the staking contract is used to get the staked APEX balance.";

Object.keys(config).forEach(chain => {
  const { factory, wrapperFactory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // count the value of erc20 wrapped and deposited in the pools
      if (wrapperFactory) {
        const wrapperPools = await api.fetchList({ lengthAbi: 'allWrappersLength', itemAbi: 'allWrappers', target: wrapperFactory })
        const tokens = await api.multiCall({ abi: 'address:originalToken', calls: wrapperPools })
        await api.sumTokens({ tokensAndOwners2: [tokens, wrapperPools]})
      }

      const tokens = await api.call({ abi: 'address[]:getAllTokens', target: factory })
      return api.sumTokens({ owners: tokens, tokens: [ADDRESSES.null] })
    }
  }
})

// module.exports.avax.staking = staking('0x5995876c9C6e2C23C1C5fc902661127fF9ed38D3','0x98B172A09102869adD73116FC92A0A60BFF4778F')