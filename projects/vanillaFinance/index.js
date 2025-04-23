const sdk = require('@defillama/sdk');
const { ethers } = require('ethers');

const addresses = {
    [56]: {
        MoneyVault: '0x994B9a6c85E89c42Ea7cC14D42afdf2eA68b72F1',
        MarketMakerVault: '0xaAd5005D2EF036d0a8b0Ab5322c852e55d9236cF',
        assetId: '0x55d398326f99059fF775485246999027B3197955',
    },
}

async function tvl(api) {
    console.log(api.chainId);
    console.log(sdk.ChainApi.BSC);
    console.log(addresses[api.chainId]);

    const balanceOfMoneyVault = await api.call({
        target: addresses[api.chainId].assetId,
        abi: 'erc20:balanceOf',
        params: [addresses[api.chainId].MoneyVault]
    });

    const balanceOfMarketMakerVault = await api.call({
        target: addresses[api.chainId].assetId,
        abi: 'erc20:balanceOf',
        params: [addresses[api.chainId].MarketMakerVault]
    });

    api.add(addresses[api.chainId].assetId, balanceOfMoneyVault);
    api.add(addresses[api.chainId].assetId, balanceOfMarketMakerVault);

    return api.getBalances();
}

module.exports = {
    'bsc': {
        tvl: async (api) => tvl(api),
    },
};