const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const markets = ['0xE15A3a1d19a48c0b1dB46C3F69b9A2F258B56963', // ETH pool
                '0xDf316b15B0d54C3159Be342377E73C8120e23f92', // BTC pool
                '0xe39b7E5F04FCD8abde312E5B7a4c49Ed1C686A49' // GHST pool
            ]
const tvlTokens = [ADDRESSES.polygon.WETH_1, // WETH
                ADDRESSES.polygon.WBTC, // WBTC
                '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7', // GHST
                ADDRESSES.polygon.USDC // USDC
            ]

module.exports = {
    methodology: 'counts all USDC/WBTC/WETH/GHST balances of market contracts.',
    start: 1677225600, // 24 Feb 2023 08:00:00 UTC
    polygon: {
        tvl: sumTokensExport({ owners: markets, tokens: tvlTokens, }),
    }
}; 