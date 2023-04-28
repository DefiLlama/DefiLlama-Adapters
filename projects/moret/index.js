const { sumTokensExport } = require('../helper/unwrapLPs')

const markets = ['0xE15A3a1d19a48c0b1dB46C3F69b9A2F258B56963', // ETH pool
                '0xDf316b15B0d54C3159Be342377E73C8120e23f92', // BTC pool
                '0xe39b7E5F04FCD8abde312E5B7a4c49Ed1C686A49' // GHST pool
            ]
const tvlTokens = ['0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
                '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
                '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7', // GHST
                '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // USDC
            ]

module.exports = {
    methodology: 'counts all USDC/WBTC/WETH/GHST balances of market contracts.',
    start: 1677225600, // 24 Feb 2023 08:00:00 UTC
    polygon: {
        tvl: sumTokensExport({ owners: markets, tokens: tvlTokens, }),
    }
}; 