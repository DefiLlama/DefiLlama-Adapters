const { sumTokensExport } = require('./helper/unwrapLPs')
const ADDRESSES = require('./helper/coreAssets.json')

const config = {
    avax: {
        tokens: [
            ADDRESSES.avax.DAI,
            ADDRESSES.avax.USDT_e,
            ADDRESSES.avax.USDC,
            ADDRESSES.avax.WBTC_e,
            ADDRESSES.avax.WETH_e,
        ],
    },
    bsc: {
        tokens: [
            ADDRESSES.bsc.DAI,
            ADDRESSES.bsc.USDC,
            ADDRESSES.bsc.USDT,
            ADDRESSES.bsc.BTCB,
            ADDRESSES.bsc.ETH,
        ],
    },
    ethereum: {
        tokens: [
            ADDRESSES.ethereum.DAI,
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.USDT,
            ADDRESSES.ethereum.WBTC,
            ADDRESSES.ethereum.WETH,
            ADDRESSES.ethereum.FRAX,
            ADDRESSES.ethereum.FXS,
        ],
    },
    fantom: {
        tokens: [
            ADDRESSES.fantom.DAI,
            ADDRESSES.fantom.USDC,
            ADDRESSES.fantom.WBTC,
        ],
    },
    polygon: {
        tokens: [
            ADDRESSES.polygon.DAI,
            ADDRESSES.polygon.USDC,
            ADDRESSES.polygon.USDT,
            ADDRESSES.polygon.WBTC,
            ADDRESSES.polygon.WETH_1,
        ],
    },
}

module.exports = {
    hallmarks: [["2023-05-07", "UST depeg"]],
    deadFrom: "2024-08-29",
    ...Object.entries(config).reduce((acc, [chain, { tokens }]) => {
        acc[chain] = { tvl: sumTokensExport({ owner: "0x54c55369a6900731d22eacb0df7c0253cf19dfff", tokens }) }
        return acc
    }, {}),
}