const sdk = require('@defillama/sdk');

const getVaultsAbi = 'address[]:getRegisteredAddresses';
const getAssetAbi = 'address:asset';
const getTotalAssets = 'uint256:totalAssets';

async function addVaultToTVL(balances, api, vaultRegistryAddress) {
  const vaultAddresses = await api.call({ target: vaultRegistryAddress, abi: getVaultsAbi });
  const assets = await api.multiCall({ abi: getAssetAbi, calls: vaultAddresses, });
  const totalAssets = await api.multiCall({ abi: getTotalAssets, calls: vaultAddresses, });

  assets.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, totalAssets[i], api.chain))
}

module.exports = {
  addVaultToTVL
}