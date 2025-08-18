const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const CONTRACTS = [
    {
        chain: 'arbitrum',
        address: '0x5A0dea46A96a5b578c9cf1730f461eD0bC9C32c6',
    },
    {
        chain: 'aleph_zero',
        address: '0x5A0dea46A96a5b578c9cf1730f461eD0bC9C32c6',
        tokens: [
            ADDRESSES.null,
            ADDRESSES.aleph_zero.WETH,
            ADDRESSES.aleph_zero.USDC,
            ADDRESSES.aleph_zero.USDT
        ]
    }
]

function calcTvl(meta) {
    return function (api) {
        if (!meta.tokens) {
            return sumTokens2({ owner: meta.address, fetchCoValentTokens: true, api })
        }
        return sumTokens2({ owner: meta.address, tokens: meta.tokens, api })
    }
}


module.exports = CONTRACTS.reduce((acc, c) => {
    acc[c.chain] = {
        tvl: calcTvl(c),
    }
    return acc
}, {});
