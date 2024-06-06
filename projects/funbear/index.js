const FUNB = 'ethereum:0xd86c0b9b686f78a7a5c3780f03e700dbbad40e01';
const stakeContractAddresses = {
  unlockedStake: '0x1C4f227A2c7F62f88a7907cBF027403603A81A64',
  yearlyStake: '0xb991FAeF710f2ae699c425a92482Fc5D3Ae0cCD7',
}

async function staking(api) {
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: Object.values(stakeContractAddresses) })
  supplies.forEach(i => api.add(FUNB, i, { skipChain: true }))
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL counts staked FUNB coins on the platform itself.',
  kava: {
    tvl: () => 0,
    staking,
  }
};
