const { log } = require("../helper/utils");


const getVaultsERC20Tvl = async (api, vaults) => {
    for (const vault of vaults) {
            try {
            // Get total supply of the boring vault token
            const totalSupply = await api.call({
                abi: 'erc20:totalSupply',
                target: vault,
            });

            // Add the vault token to balances with its total supply
            // The vault token itself represents the TVL
            api.add(vault, totalSupply);
        } catch (error) {
            log(`Error fetching data for boring vault:`, error.message);
        }
        }
}

const getERC4626VaultsTvl = async (api, vaults) => {
    for (const vault of vaults) {
        try {
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
            
        } catch (error) {
            log(`Error fetching data for morpho vault ${vault}:`, error.message);
            // Continue with other vaults if one fails
        }
    }
}

module.exports = {
    getVaultsERC20Tvl,
    getERC4626VaultsTvl,
}