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

// Remaps unpriced wrapper/receipt tokens to their priced underlying tokens
// using the tokenMappingERC20 config per chain
const applyTokenMapping = (balances, chain) => {
    const mapping = tokenMappingERC20[chain];
    if (!mapping) return;

    for (const { token, use } of mapping) {
        if (!token || !use) continue;
        const tokenAddress = token.toLowerCase();
        const balanceKey = `${chain}:${tokenAddress}`;

        // Check both prefixed and raw keys — both can exist simultaneously
        const hasPrefixed = balanceKey in balances;
        const hasRaw = tokenAddress in balances;
        if (!hasPrefixed && !hasRaw) continue;

        let targetToken = use;
        // If target token doesn't have chain prefix, add the current chain prefix
        if (!targetToken.includes(':')) {
            targetToken = `${chain}:${targetToken}`;
        }

        // Delete source keys and remap amounts to the target token
        const prefixedAmount = balances[balanceKey];
        const rawAmount = balances[tokenAddress];
        delete balances[balanceKey];
        delete balances[tokenAddress];

        if (hasPrefixed) sdk.util.sumSingleBalance(balances, targetToken, prefixedAmount);
        if (hasRaw) sdk.util.sumSingleBalance(balances, targetToken, rawAmount);
    }
}

module.exports = {
    getERC4626VaultsTvl,
    applyTokenMapping,
}