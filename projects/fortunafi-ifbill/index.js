const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    canto: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    },
    arbitrum: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    },
    blast: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    }
};

const tvl = async (_, _1, _2, { api }) => {
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
    canto: { tvl },
    arbitrum: { tvl },
    blast: { tvl }
};
