const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    canto: {
        token: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b'
    }
}

const tvl = async (api) => {
    const nav = await api.call({ target: contracts[api.chain].token, abi: 'function nav() external view returns (uint256)' });

    api.add(ADDRESSES.canto.USDC, nav / 1e12)
}

module.exports = {
    canto: {
        tvl
    }
};
