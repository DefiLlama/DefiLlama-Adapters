const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const getVaultsAbi = 'address[]:getRegisteredAddresses';
const getAssetAbi = 'address:asset';
const getStrategyAbi = 'address:strategy';
const getTotalSupplyAbi = 'uint256:totalSupply';
const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)';


async function addFraxVaultToTVL(balances, api) {
    const vaultAddresses = await api.call({ target: "0x25172C73958064f9ABc757ffc63EB859D7dc2219", abi: getVaultsAbi });
    const assets = await api.multiCall({ abi: getAssetAbi, calls: vaultAddresses, });
    const totalSupply = await api.multiCall({ abi: getTotalSupplyAbi, calls: vaultAddresses, });
    const strategies = await api.multiCall({ abi: getStrategyAbi, calls: vaultAddresses, });

    const totalAssets = [];
    for (let i = 0; i < vaultAddresses.length; i++) {
        // if the vault has no strategy: 1 share = 1 asset
        if (strategies[i] === ADDRESSES.null) {
            totalAssets.push(totalSupply[i]);
        } else {
            const assets = await api.call({ target: strategies[i], abi: convertToAssetsAbi, params: [totalSupply[i]] })
            totalAssets.push(assets);
        }
    }
    assets.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, totalAssets[i], api.chain))
}

module.exports = {
    addFraxVaultToTVL
}