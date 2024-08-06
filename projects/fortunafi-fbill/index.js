const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    canto: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
    },
    arbitrum: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
    },
    blast: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
    }
}

const tvl = async (api) => {
    const nav = await api.call({ target: contracts[api.chain].token, abi: 'function nav() external view returns (uint256)' });

    switch (api.chain) {
        case 'blast':
            api.add(ADDRESSES['blast'].USDB, nav);
            break;
        default:
            api.add(ADDRESSES[api.chain].USDC, nav / 1e12);
    }
}

module.exports = {
    misrepresentedTokens: true,
    canto: { tvl },
    arbitrum: { tvl },
    blast: { tvl }
};
