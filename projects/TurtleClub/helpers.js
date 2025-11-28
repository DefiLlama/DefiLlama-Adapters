const { log } = require("../helper/utils");

const getERC4626VaultsTvl = async (api, vaults) => {
    for (const vault of vaults) {
            // Get the underlying asset from the vault
            const asset = await api.call({
                abi: 'function asset() view returns (address)',
                target: vault,
            });
            
            // Get total assets from the morpho vault
            const totalAssets = await api.call({
                abi: 'function totalAssets() view returns (uint256)',
                target: vault,
            });
            
            // Add the underlying asset with the total assets amount
            // This represents the actual underlying assets held by the vault
            api.add(asset, totalAssets);
    }
}

module.exports = {
    getERC4626VaultsTvl,
}