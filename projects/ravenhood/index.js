const RVH_TOKEN = '0x96765066f6a040a21EB027167D2315B707c82633'
const STAKING_POOL = '0xAc558b558E228DE033Cd97C580618C4403CB05a6'

module.exports = {
  methodology: 'Staking is RVH deposited into RVHStakingPool.',
  robinhood: {
    tvl: () => ({}),
    staking: async (api) => {
      const staked = await api.call({ target: STAKING_POOL, abi: 'uint256:totalStaked' })
      api.add(RVH_TOKEN, staked)
      return api.getBalances()
    },
  },
}
