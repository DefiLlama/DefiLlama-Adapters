const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const markets = ['0x73917c0b432727Ce608824D1bb5a784ed1a93695', // ETH pool
                '0xb0c2E53336106DFA3c3E4DC6A2Df25af0ae2626d', // BTC pool
                '0x090015A60a99Fa4551e458E1cb95bE3C381B1C54' // GHST pool
            ]
const tvlTokens = [ADDRESSES.polygon.WETH_1, // WETH
                ADDRESSES.polygon.WBTC, // WBTC
                '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7', // GHST
                ADDRESSES.polygon.USDC // USDC
            ]

module.exports = {
    methodology: 'counts all USDC/WBTC/WETH/GHST balances of market contracts.',
    start: '2023-02-24', // 24 Feb 2023 08:00:00 UTC
    polygon: {
        tvl: sumTokensExport({ owners: markets, tokens: tvlTokens, }),
    }
}; 