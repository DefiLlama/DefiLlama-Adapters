const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    arbitrum: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    },
    base: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    },
    canto: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    },
    ethereum: {
        token: '0x4B57e1E3fd684d3bb82A0652c77FD7412dF6a2A5'
    },
    polygon: {
        token: '0x8fC1F841b02d7C64b889EDC7Dbe50c9CB5860025'
    },
    polygon_zkevm: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    }
}

const tvl = async (_, _1, _2, { api }) => {
    const nav = await api.call({ target: contracts[api.chain].token, abi: 'function nav() external view returns (uint256)' });

    api.add(ADDRESSES[api.chain].USDC, (nav + 1) / 1e12)
}

module.exports = {
    arbitrum: {
        tvl
    },
    base: {
        tvl
    },
    canto: {
        tvl
    },
    ethereum: {
        tvl
    },
    polygon: {
        tvl
    },
    polygon_zkevm: {
        tvl
    }
};
