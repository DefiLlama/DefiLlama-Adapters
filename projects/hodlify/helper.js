const { erc4626Abi, stargateLpStakingAbi, stargatePoolAbi } = require('./abi');
const ADDRESSES = require('../helper/coreAssets.json')
const sgETHMapping = {
  ethereum: '0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c',
  arbitrum: '0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0',
  optimism: '0xb69c8CBCD90A39D8D3d3ccf0a3E968511C3856A0',
}

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
  let assets = await api.multiCall({ calls: lpPools, abi: stargatePoolAbi.token, });
  // map stETH to ETH
  const stETH = sgETHMapping[api.chain]?.toLowerCase();
  assets = assets.map((asset) => {
    return asset.toLowerCase() === stETH ? ADDRESSES.null : asset;
  });

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