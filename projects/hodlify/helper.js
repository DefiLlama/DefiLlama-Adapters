const { erc4626Abi, stargateLpStakingAbi, stargatePoolAbi } = require('./abi');

// convert stargate lp amount to underlying asset amount
const getStrategyVaultValues = async (api, vaultAddresses) => {
  // find the lpStaking contract address for each vault
  const lpStakingAddresses = await api.multiCall({ calls: vaultAddresses, abi: 'address:lpStaking', });
  // find the lpStaking poolId for each vault
  const lpStakingPoolIds = await api.multiCall({ calls: vaultAddresses, abi: 'uint256:lpStakingPoolId', });
  // find the lp staking pool of each vault
  const lpPools = await api.multiCall({ calls: vaultAddresses, abi: 'address:lp', });
  // find the lpAmount
  const lpAmounts = (await api.multiCall({
    calls: vaultAddresses.map((vaultAddress, i) => ({
      target: lpStakingAddresses[i],
      params: [lpStakingPoolIds[i], vaultAddress],
    })),
    abi: stargateLpStakingAbi.userInfo,
  })).map(([amount]) => amount);
  // find the amount of assets convert from lpAmount
  const convertedAmounts = await api.multiCall({
    calls: lpPools.map((lpPool, i) => ({
      target: lpPool,
      params: [lpAmounts[i]],
    })),
    abi: stargatePoolAbi.amountLPtoLD,
  });
  // find the underlying asset of each lp pool
  const assets = await api.multiCall({ calls: lpPools, abi: stargatePoolAbi.token, });

  return [assets, convertedAmounts];
}

// get the underlying asset of each base vault
const getVaultToken = async (api, addresses) => {
  return api.multiCall({ calls: addresses, abi: 'address:token', });
}

// get the underlying asset of each erc4626 vault
const get4626VaultToken = async (api, addresses) => {
  return api.multiCall({ calls: addresses, abi: erc4626Abi.asset, });
}

module.exports = {
  getVaultToken,
  get4626VaultToken,
  getStrategyVaultValues,
}