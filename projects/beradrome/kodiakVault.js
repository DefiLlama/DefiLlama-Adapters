const sdk = require('@defillama/sdk');

async function updateKodiakVaultTvl(api, pluginAddress, balances, transform) {
    const pairAddress = await api.call({
        abi: 'function getToken() view returns (address)',
        target: pluginAddress
    });

    const assetTokens = await api.call({
        abi: 'function getAssetTokens() view returns (address[])',
        target: pluginAddress
    });
    const totalSupply = await api.call({
        abi: 'function totalSupply() view returns (uint256)',
        target: pluginAddress
    });

    const token0Address = assetTokens[0];
    const token1Address = assetTokens[1];

    const decimals0 = await api.call({
        abi: 'erc20:decimals',
        target: token0Address
    });
    const decimals1 = await api.call({
        abi: 'erc20:decimals',
        target: token1Address
    });

    const kodiakTotalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: pairAddress
    });

    const formattedPluginTotalSupply = totalSupply / 10 ** 18;
    const formattedKodiakTotalSupply = kodiakTotalSupply / 10 ** 18;

    const ratio = formattedKodiakTotalSupply === 0 ? 0 : formattedPluginTotalSupply / formattedKodiakTotalSupply;

    const reserves = await api.call({
        abi: 'function getUnderlyingBalances() view returns (uint256, uint256)',
        target: pairAddress
    });

    const reserve0 = reserves[0] / (10 ** decimals0);
    const reserve1 = reserves[1] / (10 ** decimals1);

    const reserve0Beradrome = reserve0 * ratio;
    const reserve1Beradrome = reserve1 * ratio;

    sdk.util.sumSingleBalance(balances, transform(token0Address), reserve0Beradrome);
    sdk.util.sumSingleBalance(balances, transform(token1Address), reserve1Beradrome);
}

module.exports = {
    updateKodiakVaultTvl
};
