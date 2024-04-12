const { clyVesting } = require("./clyVesting")

const colonyGovernanceToken = "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6";

const stakingV1Contract = "0x5B0d74C78F2588B3C5C49857EdB856cC731dc557";
const stakingV2Contract = "0x7CcDa6E26dCeD1Ba275c67CD20235790ed615A8D";
const stakingV3Contract = "0x62685d3EAacE96D6145D35f3B7540d35f482DE5b";

const vestingContract = "0xEFAc81f709d314604a7DaEe9ca234dA978c2Be20";

async function staking({ api }) {
  const stakingV1 = (
    await api.call({
      abi: "function totalStaked() external view returns (uint256)",
      target: stakingV1Contract,
    })
  )

  const stakingV2 = (
    await api.call({
      abi: "function totalStake() external view returns (uint256)",
      target: stakingV2Contract,
    })
  )

  const stakingV3 = (
    await api.call({
      abi: "function totalStake() external view returns (uint256)",
      target: stakingV3Contract,
    })
  )

  api.add(colonyGovernanceToken, stakingV1)
  api.add(colonyGovernanceToken, stakingV2)
  api.add(colonyGovernanceToken, stakingV3)
}

module.exports = {
  timetravel: true,
  methodology:
    "Staking is calculated based on CLY tokens locked on Colony staking contracts. " +
    "Vesting is calculated as already unlocked and available to claim CLY tokens in the vesting contract",
  avax:{
    tvl: async () => ({}),
    staking,
    vesting: clyVesting(colonyGovernanceToken, vestingContract),
  },
};
