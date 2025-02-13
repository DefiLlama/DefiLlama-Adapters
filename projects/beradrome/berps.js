const sdk = require('@defillama/sdk');

async function updateBerpsVaultTvl(api, pluginAddress, balances, transform) {
    const tokenAddress = await api.call({
        abi: 'function getToken() view returns (address)',
        target: pluginAddress
    });

    const totalSupply = await api.call({
        abi: 'function totalSupply() view returns (uint256)',
        target: pluginAddress
    });

    const decimals = await api.call({
        abi: 'erc20:decimals',
        target: tokenAddress
    });

    const reserve = totalSupply / (10 ** decimals);

    sdk.util.sumSingleBalance(balances, transform(tokenAddress), reserve);
}

module.exports = {
    updateBerpsVaultTvl
};
