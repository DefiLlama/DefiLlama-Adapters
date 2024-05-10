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

    return api.getBalances()
  }
}

module.exports = {
  stakingRewards,
}
