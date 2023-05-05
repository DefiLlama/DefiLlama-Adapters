const { sumTokensExport } = require('../helper/unwrapLPs')

const markets = ['0x73917c0b432727Ce608824D1bb5a784ed1a93695', // ETH pool
                '0xb0c2E53336106DFA3c3E4DC6A2Df25af0ae2626d', // BTC pool
                '0x090015A60a99Fa4551e458E1cb95bE3C381B1C54' // GHST pool
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