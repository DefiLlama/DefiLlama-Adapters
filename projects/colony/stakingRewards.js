/// Rewards which are distributed to stakers in the staking contract.
function stakingRewards(colonyGovernanceToken, stakingV3Contract) {
  return async (api) => {
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
    return api.sumTokens({ owner: stakingV3Contract, tokens: [...rewardTokens, ...customRewardTokens].map(i => i.address), blacklistedTokens: [colonyGovernanceToken]})
  }
}

module.exports = {
  stakingRewards,
}
