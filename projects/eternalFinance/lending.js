const sdk = require("@defillama/sdk");
const { getResource, coreTokens } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
const { moduleAddress, resourceAddress } = require("./helper");

const vaultInfoStruct = `${moduleAddress}::vault::Vaults`;

async function lendingTvl() {
    /// @dev get vault info resources
    const { vaults } = await getResource(resourceAddress, vaultInfoStruct);
    const balances = {};
    vaults.data.forEach((vault) => {
        const token = vault.key;
        const balance = vault.value.balance;

        const isCoreAsset = coreTokens.includes(token);
        if (isCoreAsset) {
            sdk.util.sumSingleBalance(balances, token, balance);
        }
    });

    return transformBalances('aptos', balances);
}

module.exports = {
    lendingTvl,
}