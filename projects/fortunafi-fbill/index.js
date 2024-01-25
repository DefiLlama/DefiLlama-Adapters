const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    arbitrum: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
    },
    base: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
    },
    canto: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
    },
    ethereum: {
        token: '0x108Ec61bd5A91F5596F824832524C6b6002E3F03'
    },
    polygon: {
        token: '0xB61c107Bf88F01A57F9aCFaB7Fa7BCF9637a950F'
    },
    polygon_zkevm: {
        token: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08'
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
