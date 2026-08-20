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
const { turtleVaults, defaultTokens, tokens } = require("./assets");
const { sumTokensExport } = require("../helper/unwrapLPs");
    
module.exports = {
    doublecounted: true,
    ethereum: {
        tvl: async (api) => {
            const erc4626Vaults = turtleVaults.ethereum.filter(vault => vault.strategy === "erc4626").map(vault => vault.address);

            // Handle Morpho Vaults
            await getERC4626VaultsTvl(api, erc4626Vaults);
     
            const vaults = turtleVaults.ethereum.filter(vault => vault.strategy === "erc20").map(vault => vault.address);

            const m = sumTokensExport({
                owners: vaults,
                tokens: Object.values(tokens.ethereum),
                permitFailure: true,
                tokenConfig: { onlyWhitelisted: false },
            });

            const balances = await m(api);

            return balances;
        },
    },
    linea: {
        tvl: async (api) => {
            const erc4626Vaults = turtleVaults.linea.map(vault => vault.address);

            // Handle ERC4626 Vaults
            await getERC4626VaultsTvl(api, erc4626Vaults);

            return api.getBalances();
        },
    },
    avax: {
        tvl: async (api) => {
            const vaults = turtleVaults.avax.map(vault => vault.address);
        
            await getERC4626VaultsTvl(api, vaults);

            return api.getBalances();
        },
    },
};
            