const sdk = require('@defillama/sdk');

async function updateBerpsVaultTvl(api, pluginAddress, balances) {
    const tokenAddress = await api.call({
        abi: 'function getToken() view returns (address)',
        target: pluginAddress
    });

    const totalSupply = await api.call({
        abi: 'function totalSupply() view returns (uint256)',
        target: pluginAddress
    });

    sdk.util.sumSingleBalance(balances, tokenAddress, totalSupply, api.chain);
}

module.exports = {
    updateBerpsVaultTvl
};
