const FACTORY_SINGLETON_ADDR = '0xFc6387f581d2A827F183A9ea68f07063F99744dE'

const getStakingVaultTvl = async (api, stakingVaultFactory) => {
  if (!stakingVaultFactory) return
  const vaults = await api.fetchList({ lengthAbi: 'length', itemAbi: 'stakingVaults', target: stakingVaultFactory })
  const stakedTokens = await api.multiCall({ calls: vaults, abi: 'address:stakedToken' })
  await api.sumTokens({ tokensAndOwners2: [stakedTokens, vaults] })
}

const getRewardTvl = async (api, rewardFactory) => {
  if (!rewardFactory) return
  const stakeRewarders = await api.fetchList({ lengthAbi: 'uint:stakeRewarderLength', itemAbi: 'stakeRewarders', target: rewardFactory })
  const tokensAndOwners = []
  await Promise.all(stakeRewarders.map(async (stakeRewarder) => {
    const rewardTokens_ = await api.fetchList({ lengthAbi: 'rewardLength', itemAbi: 'rewardTokens', target: stakeRewarder })
    tokensAndOwners.push(...rewardTokens_.map(token => [token, stakeRewarder]))
  }))
  await api.sumTokens({ tokensAndOwners })
}

const tvl = async (api) => {
  const { stakingVaultFactory = FACTORY_SINGLETON_ADDR, rewardFactory } = config[api.chain]
  await getStakingVaultTvl(api, stakingVaultFactory)
  await getRewardTvl(api, rewardFactory)
}

module.exports = {
  start: '2024-03-19', // May-17-2024 12:45:31 PM +UTC
  methodology: 'GullNetwork TVL including total values of assets staked in our staking vaults, and assets in the liquidity pool.',
}

const config = {
  ethereum: {},
  bsc: {},
  manta: {
    rewardFactory: '0x2a18164B5e84d9C1B03ddbb5A1982A35cF75E506'
  },
  base: {},
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})