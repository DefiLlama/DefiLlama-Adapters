const sdk = require("@defillama/sdk")

// const { clyVesting } = require("./clyVesting")
const { stakingRewards } = require("./stakingRewards")
const { earlyStageInvestments } = require("./earlyStageInvestments")
const { staking } = require("../helper/staking")
const { getUniTVL } = require("../helper/unknownTokens")

const colonyGovernanceToken = "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6";

const stakingV1Contract = "0x5B0d74C78F2588B3C5C49857EdB856cC731dc557";
const stakingV2Contract = "0x7CcDa6E26dCeD1Ba275c67CD20235790ed615A8D";
const stakingV3Contract = "0x62685d3EAacE96D6145D35f3B7540d35f482DE5b";

const vestingContract = "0xEFAc81f709d314604a7DaEe9ca234dA978c2Be20";

const projectNestFactory = "0x9E1Ac58559307A7ce70104810B7d6E43E74bFA1e";
const colonyDexFactory = "0x814EBF333BDaF1D2d364c22a1e2400a812f1F850";

async function _staking(api) {
  const bals = await api.multiCall({ abi: 'uint256:totalStaked', calls: [stakingV1Contract,] })
  const bals1 = await api.multiCall({ abi: 'uint256:totalStake', calls: [stakingV2Contract, stakingV3Contract] })
  api.add(colonyGovernanceToken, bals.concat(bals1))
}

function _tvl() {
  const stakingRewardsTVL = stakingRewards(colonyGovernanceToken, stakingV3Contract)
  const earlyStageInvestmentsTVL = earlyStageInvestments(projectNestFactory)

  const colonyDexTVL = getUniTVL({
    factory: colonyDexFactory,
    useDefaultCoreAssets: true
  })

  return sdk.util.sumChainTvls([
    stakingRewardsTVL,
    earlyStageInvestmentsTVL,
    colonyDexTVL
  ])
}

module.exports = {
  methodology:
    "Staking is calculated based on CLY tokens locked on Colony staking contracts. " +
    "Vesting is calculated as CLY tokens in the vesting contract. " +
    "TVL also includes rewards in various tokens distributed in the staking contract, " +
    "actual fundraised stablecoins in projects (Nests), and liquidity from Colony Dex.",
  avax: {
    start: '2021-12-01', // CLY Token deployment
    tvl: _tvl(),
    staking: _staking,
    // vesting: clyVesting(colonyGovernanceToken, vestingContract),
    vesting: staking(vestingContract, colonyGovernanceToken),
  },
  hallmarks: [
      [1651241728, "Staking V2 Launch"],
      [1711370069, "Staking V3 Launch"],
      [1715688000, "EarlyStage Launch"],
      [1719792000, "Liquid Vesting DEX Launch"]
  ],
};
