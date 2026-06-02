const contracts = {
  bsc: '0x1C5204bb87cE4A2c2e00d42f20a5aF24705c2496', // EOA: 0x4f113b0F4564434c9085678BEF7Ad59D0632f81D
  base: '0xA4B852C076A119586269054E919FFF1F711A52cA', // EOA: 0x9BaAf0FaA1f473F4E5626E060e87842A2DD720C8
  xlayer: '0xe5ef454B050e7a6CfFe692C05B71eE2768c32Bba', // EOA: 0x6b5b583E9B1AAa4f67b94D3E3c281d9aFaEbC457
}

async function tvl(api) {
  const stakingContract = contracts[api.chain]

  const tokenResult = await api.call({
    target: stakingContract,
    abi: 'function getAllSupportedTokens() view returns (address[] tokens, string[] names)',
  })
  const tokens = tokenResult[0]

  const aggs = await api.multiCall({
    calls: tokens.map((token) => ({
      target: stakingContract,
      params: [token],
    })),
    abi: 'function getTokenAgg(address token) view returns (uint256 totalStaked, uint256 totalActive, uint256 rewardsGranted, uint256 ungrantedRewards, uint256 stakingUsersCount)',
  })

  tokens.forEach((token, index) => {
    const agg = aggs[index]
    api.add(token, agg[1])
  })
}

module.exports = {
  methodology: 'Counts all deposits transferred to protocol treasury EOAs after staking using on-chain token-level staking aggregates from getTokenAgg(token).',
  bsc: { tvl },
  base: { tvl },
  xlayer: { tvl },
}
