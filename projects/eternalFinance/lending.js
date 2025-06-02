const { getResource, coreTokensAptos } = require("../helper/chain/aptos");
const { moduleAddress, resourceAddress } = require("./helper");

const vaultInfoStruct = `${moduleAddress}::vault::Vaults`;

async function lendingTvl(api) {
    /// @dev get vault info resources
    const { vaults } = await getResource(resourceAddress, vaultInfoStruct);
    vaults.data.forEach((vault) => {
        const token = vault.key;
        const balance = vault.value.balance;

        const isCoreAsset = coreTokensAptos.includes(token);
        if (isCoreAsset) {
            api.add(token, balance);
        }
    });

}

module.exports = {
    lendingTvl,
}