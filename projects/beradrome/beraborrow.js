const sdk = require('@defillama/sdk');

async function updateBeraborrowTvl(api, pluginAddress, balances, transform) {
    const sTokenAddress = await api.call({
        abi: 'function getToken() view returns (address)',
        target: pluginAddress
    });

    const totalSupply = await api.call({
        abi: 'function totalSupply() view returns (uint256)',
        target: pluginAddress
    });

    const sTokenDecimals = await api.call({
        abi: 'erc20:decimals',
        target: sTokenAddress
    });

    const underlyingToken = await api.call({
        abi: 'function asset() view returns (address)',
        target: pluginAddress
    });

    const totalUnderlyingInSToken = await api.call({
        abi: 'function totalAssets() view returns (uint256)',
        target: pluginAddress
    });

    const totalSupplySToken = await api.call({
        abi: 'function totalSupply() view returns (uint256)',
        target: pluginAddress
    });

    const totalSupplyFormatted = totalSupply / (10 ** sTokenDecimals);
    const totalSupplySTokenFormatted = totalSupplySToken / (10 ** sTokenDecimals);
    const totalUnderlyingInSTokenFormatted = totalUnderlyingInSToken / (10 ** sTokenDecimals);

    const ratio = totalSupplySTokenFormatted === 0 ? 0 : totalSupplyFormatted / totalSupplySTokenFormatted;

    const reserve = ratio * totalUnderlyingInSTokenFormatted;

    sdk.util.sumSingleBalance(balances, transform(underlyingToken), reserve);
}

module.exports = {
    updateBeraborrowTvl
};
