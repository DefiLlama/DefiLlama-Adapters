const stakingAbi = {
  getAllSupportedTokens:
    'function getAllSupportedTokens() view returns (address[] tokens, string[] names)',

  getTokenAgg:
    'function getTokenAgg(address token) view returns (uint256 totalStaked, uint256 totalActive, uint256 rewardsGranted, uint256 ungrantedRewards, uint256 stakingUsersCount)',
}

const contracts = {
  bsc: '0x1C5204bb87cE4A2c2e00d42f20a5aF24705c2496',
  base: '0xA4B852C076A119586269054E919FFF1F711A52cA',
  xlayer: '0xe5ef454B050e7a6CfFe692C05B71eE2768c32Bba',
}

function tvl(chain) {
  return async (api) => {
    const stakingContract = contracts[chain]

    const tokenResult = await api.call({
      target: stakingContract,
      abi: stakingAbi.getAllSupportedTokens,
    })

    const tokens = tokenResult[0]

    const aggs = await api.multiCall({
      calls: tokens.map((token) => ({
        target: stakingContract,
        params: [token],
      })),
      abi: stakingAbi.getTokenAgg,
    })

    tokens.forEach((token, index) => {
      const agg = aggs[index]

      // getTokenAgg return order:
      // 0 = totalStaked - lifetime total, DO NOT use for TVL
      // 1 = totalActive - current active staking, use this for TVL
      // 2 = rewardsGranted
      // 3 = ungrantedRewards
      // 4 = stakingUsersCount
      const totalActive = agg[1]

      api.add(token, totalActive)
    })
  }
}

module.exports = {
  methodology:
    'Counts active user principal currently staked in WStaking, using on-chain token-level staking aggregates from getTokenAgg(token). Lifetime totalStaked, rewards, and user counts are excluded. User deposits are transferred to protocol hot wallets after staking.',

  bsc: {
    tvl: tvl('bsc'),
  },

  base: {
    tvl: tvl('base'),
  },

  xlayer: {
    tvl: tvl('xlayer'),
  },
}