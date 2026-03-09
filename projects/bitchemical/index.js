const BCHEM = '0x9102E0A76a5e2823073Ed763a32Ba8ca8521b1F3'
const STAKING = '0x01F82039810f18F703F4c8b943940ce04Fa00C78'

const totalStakedAbi = 'function totalStaked() view returns (uint256)'
const rewardVaultAbi = 'function rewardVault() view returns (uint256)'

async function stakingTvl(api) {
  const [totalStaked, rewardVault] = await Promise.all([
    api.call({ target: STAKING, abi: totalStakedAbi }),
    api.call({ target: STAKING, abi: rewardVaultAbi }),
  ])

  api.add(BCHEM, totalStaked)
  api.add(BCHEM, rewardVault)
}

module.exports = {
  methodology:
    'Counts BCHEM locked in the Bitchemical staking contract on BNB Chain as totalStaked plus rewardVault.',
  bsc: {
    tvl: stakingTvl,
    staking: stakingTvl,
  },
}
