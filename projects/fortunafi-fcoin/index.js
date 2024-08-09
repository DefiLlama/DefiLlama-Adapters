const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    canto: {
        token: '0x855EA9979189383ef5A85eB74Ed3a02E2604EA81'
    },
    arbitrum: {
        token: '0x108Ec61bd5A91F5596F824832524C6b6002E3F03'
    },
    ethereum: {
        token: '0x2378aC4EEAAe44695E1e3d0fcAEEd6ba8b0F5108'
    },
    blast: {
        token: '0xE85Ae7e8Fa0Ee69426019b7D3E77843673807ABE'
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
    blast: { tvl },
    ethereum: { tvl }
};
