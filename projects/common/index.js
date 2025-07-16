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
            '0x0000000000000000000000000000000000000000',
            '0xB3f0eE446723f4258862D949B4c9688e7e7d35d3',
            '0x18d25B4e18165c97e1285212e5d1f80eDD6d3Aa7',
            '0xD648529D4803d3467bA8850577BEd4e4b8Ae583C'
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
