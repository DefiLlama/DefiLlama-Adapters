// const { clyVesting } = require("./clyVesting")
const { staking } = require('../helper/staking')

const colonyGovernanceToken = "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6";

const stakingV1Contract = "0x5B0d74C78F2588B3C5C49857EdB856cC731dc557";
const stakingV2Contract = "0x7CcDa6E26dCeD1Ba275c67CD20235790ed615A8D";
const stakingV3Contract = "0x62685d3EAacE96D6145D35f3B7540d35f482DE5b";

const vestingContract = "0xEFAc81f709d314604a7DaEe9ca234dA978c2Be20";

async function _staking(api) {
  const bals = await api.multiCall({ abi: 'uint256:totalStaked', calls: [stakingV1Contract,] })
  const bals1 = await api.multiCall({ abi: 'uint256:totalStake', calls: [stakingV2Contract, stakingV3Contract] })
  api.add(colonyGovernanceToken, bals.concat(bals1))
}

async function tvl(_a, _b, _cb, { api }) {
  const rewardTokensListLength = Number(
    await api.call({
      abi: "uint256:rewardTokensListLenght",
      target: stakingV3Contract,
    })
  );

  const customRewardTokensListLength = Number(
    await api.call({
      abi: "uint256:customRewardTokensListLenght",
      target: stakingV3Contract,
    })
  );

  const rewardTokens = (await api.multiCall({
    abi: "function getRewardTokensListIndex(uint256 index) external view returns (address, uint8)",
    target: stakingV3Contract,
    calls: [...Array(rewardTokensListLength).keys()].map(i => ({
      params: i
    }))
  })).map(r => ({ address: r[0], category: r[1]}))

  const customRewardTokens = (await api.multiCall({
    abi: "function getCustomRewardTokensListIndex(uint256 index) external view returns (address, uint8)",
    target: stakingV3Contract,
    calls: [...Array(customRewardTokensListLength).keys()].map(i => ({
      params: i
    }))
  })).map(r => ({ address: r[0], category: r[1]}))

  // the same tokens can appear in different categories
  const uniqueRewardTokensSet = new Set();
  [...rewardTokens, ...customRewardTokens].forEach(token => {
    uniqueRewardTokensSet.add(token.address)
  })

  const handleCLYReward = async () => {
    const totalStake = BigInt(await api.call({
      abi: 'uint256:totalStake',
      target: stakingV3Contract,
    }))

    const balanceOf = BigInt(await api.call({
      abi: 'erc20:balanceOf',
      target: colonyGovernanceToken,
      params: stakingV3Contract
    }))

    api.add(colonyGovernanceToken, balanceOf - totalStake)
  }

  for(const token of uniqueRewardTokensSet) {
    // CLY has to be handled separately because some of the balance is locked in staking.
    if (token === colonyGovernanceToken) {
      await handleCLYReward()
      continue
    }

    api.add(token, await api.call({
      abi: 'erc20:balanceOf',
      target: token,
      params: stakingV3Contract
    }))
  }
}

module.exports = {
  methodology:
    "Staking is calculated based on CLY tokens locked on Colony staking contracts. " +
    "Vesting is calculated as CLY tokens in the vesting contract." +
    "TVL includes also rewards in various tokens distributed continuously for stakers.",
  avax: {
    start: 1638367059, // CLY Token deployment
    tvl,
    staking: _staking,
    // vesting: clyVesting(colonyGovernanceToken, vestingContract),
    vesting: staking(vestingContract, colonyGovernanceToken),
  },
  hallmarks: [
      [1651241728, "Staking V2 Launch"],
      [1711370069, "Staking V3 Launch"]
  ],
};
