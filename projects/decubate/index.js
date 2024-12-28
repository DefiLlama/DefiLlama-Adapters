const { staking } = require('../helper/staking')

const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2"
const stakingPools = [
  "0xD1748192aE1dB982be2FB8C3e6d893C75330884a", // Legacy staking pool contract
  "0xe740758a8cd372c836857defe8011e4e80e48723"  // New staking pools contract
]

module.exports = {
  bsc: {
    tvl: async () => ({}),
    staking: staking(stakingPools, DCBToken,)
  },
}