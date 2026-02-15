const { log } = require("../helper/utils");
const { tokenMappingERC20 } = require("./assets");
const sdk = require('@defillama/sdk');

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

const applyTokenMapping = (balances, chain) => {
    const mapping = tokenMappingERC20[chain];
    if (!mapping) return;

    for (const { token, use } of mapping) {
        if (!token) continue;
        const tokenAddress = token.toLowerCase();
        const balanceKey = `${chain}:${tokenAddress}`;

        let amount = balances[balanceKey];

        // Also check un-prefixed key just in case
        if (!amount && balances[tokenAddress]) {
            amount = balances[tokenAddress];
            delete balances[tokenAddress];
        } else if (amount) {
            delete balances[balanceKey];
        }

        if (amount) {
            let targetToken = use;
            // If target token doesn't have chain prefix, add the current chain prefix
            if (targetToken && !targetToken.includes(':')) {
                targetToken = `${chain}:${targetToken}`;
            }
            if (targetToken) {
                sdk.util.sumSingleBalance(balances, targetToken, amount);
            }
        }
    }
}

module.exports = {
    getERC4626VaultsTvl,
    applyTokenMapping,
}
