const config = {
  ethereum: {
    token: '0x884649f1fE3Bf3Ae0Bd720Eaf660cB561dcE39ef',
    stakingVault: '0x8da35B1BBC0209D5140B64ff256dAe2Db703165d',
  },
  base: {
    token: '0x42BAb297f90e6285546F05abdF4C42D8415E9794',
    stakingVault: '0x63E311CF0cBfb1C0984EEad4C416B6b830b046Ab',
  },
}

async function staking(api) {
  const { token, stakingVault } = config[api.chain]
  const totalStaked = await api.call({ target: stakingVault, abi: 'uint256:totalStaked' })
  api.add(token, totalStaked)
}

const tvl = async () => ({})

module.exports = {
  methodology: 'Staking TVL is the PUPCUP principal deposited in the Ethereum and Base staking vaults, as reported by each vault\'s totalStaked value. LayerZero bridge escrow balances and staking reward reserves are excluded.',
  ethereum: { tvl, staking },
  base: { tvl, staking },
}
