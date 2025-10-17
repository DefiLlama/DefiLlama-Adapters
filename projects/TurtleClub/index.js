const { getVaultsERC20Tvl, getERC4626VaultsTvl } = require("./helpers");
const { turtleVaults } = require("./assets");
    
module.exports = {
    doublecounted: true,
    ethereum: {
        tvl: async (api) => {
            const erc20Vaults = turtleVaults.ethereum.filter(vault => vault.strategy === "erc20").map(vault => vault.address);

            // Handle Boring Vaults
            await getVaultsERC20Tvl(api, erc20Vaults);
            const erc4626Vaults = turtleVaults.ethereum.filter(vault => vault.strategy === "erc4626").map(vault => vault.address);

            // Handle Morpho Vaults
            await getERC4626VaultsTvl(api, erc4626Vaults);
     
            return api.getBalances();
        },
    },
    linea: {
        tvl: async (api) => {
            const erc4626Vaults = turtleVaults.linea.filter(vault => vault.strategy === "erc4626").map(vault => vault.address);

            // Handle ERC4626 Vaults
            await getERC4626VaultsTvl(api, erc4626Vaults);

            return api.getBalances();
        },
    },
};
            