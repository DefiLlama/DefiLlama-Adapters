const sdk = require('@defillama/sdk');

async function updateKodiakVaultTvl(api, pluginAddress, balances) {
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

    const reserve0BeradromeScaled = BigInt(Math.round(reserve0Beradrome * 10 ** decimals0));
    const reserve1BeradromeScaled = BigInt(Math.round(reserve1Beradrome * 10 ** decimals1));

    sdk.util.sumSingleBalance(balances, token0Address, reserve0BeradromeScaled, api.chain);
    sdk.util.sumSingleBalance(balances, token1Address, reserve1BeradromeScaled, api.chain);
}

module.exports = {
    updateKodiakVaultTvl
};
