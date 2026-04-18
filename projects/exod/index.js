const { getAssetInfo } = require('../helper/chain/algorand');

const exodAddresses = {
    arbitrum: {
        token: '0x116998824ff90532906bab91becea4a8e4ce06db',
    },
    algorand: {
        token: '213345970'
    }
};

async function tvl(api) {
    const { chain } = api;
    const chainAddresses = exodAddresses[chain];
    if (!chainAddresses) return;

    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: chainAddresses.token,
    });

    api.add(chainAddresses.token, totalSupply);
}

async function algorandTvl(api) {
    const assetId = exodAddresses.algorand.token;
    const info = await getAssetInfo(assetId);
    api.add(assetId, info.circulatingSupply);
}

module.exports = {
    methodology: 'TVL is calculated as the total supply of EXOD tokens on Arbitrum and circulating supply on Algorand (excluding reserve).',
    arbitrum: { tvl },
    algorand: { tvl: algorandTvl }
};