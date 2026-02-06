const { sumTokensExport } = require('./helper/unwrapLPs')
const ADDRESSES = require('./helper/coreAssets.json')

const config = {
    avax: {
        owners: [
            "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
            "0x299956ae1fbd9485689395b6b01d7f7d1ab7f776",
            "0xbdfd06befeb8cd629b31d89a315092d10435be06",
            "0x48a02b26f544b00f896e5548004d6d80191b774a",
            "0x0930179958a0f34ffab00dd8feb16b7b250652e0",
            "0x4582ae9a5d051a8bb09b416c946cbae9a7817aa6",
        ],
        tokens: [
            ADDRESSES.avax.DAI,
            ADDRESSES.avax.USDT_e,
            ADDRESSES.avax.USDC,
            ADDRESSES.avax.WBTC_e,
            ADDRESSES.avax.WETH_e,
        ],
    },
    bsc: {
        owners: [
            "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
            "0xad4c25634e3818d674ddc07b98135ed6db7ef307",
            "0x5d767d4e250b5c8640cb2bf7e7cd3acaeb7768e1",
            "0x65950dd2a3d8316c197bda1a353aed046035b1c9",
            "0x0cc7096480e78409aec14795a96efeaf3e0b4b38",
            "0x5b1e3e9f24455debd6f3a0c4b8bc6b46ca57f68c",
            "0x295f917cd26a708463b61730226316040418352c",
        ],
        tokens: [
            ADDRESSES.bsc.DAI,
            ADDRESSES.bsc.USDC,
            ADDRESSES.bsc.USDT,
            ADDRESSES.bsc.BTCB,
            ADDRESSES.bsc.ETH,
        ],
    },
    ethereum: {
        owners: [
            "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
            "0xf8a0d53ddc6c92c3c59824f380c0f3d2a3cf521c",
            "0xf67d8b970a0a955b5ff2a80b8dfd6aff21567633",
            "0x55046f53eb9fa069286969d73432b769f068e1fc",
            "0x8d589f403d5232e37bd30e02260ea6b6ad061f3f",
            "0xf2403a61c7a97a1a1b94a225173f6dd03614b907",
            "0x4dee4b939371a9957f5f36a26341f40a88eed0cc",
            "0x9c217efa90a6a2bb5f0543a0be7d682ce6cf5275",
        ],
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
        owners: [
            "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
            "0x334d7e33f3b0ac04309b17ca56bcb0f0fa3d0efd",
            "0xb05a3640132642e6297980376129354ee21a9fc6",
            "0x8f9d8cfd0b018b1939bb24e2ce48a9e4040fb68a",
            "0x5115cd7e0dd0886c11e28e54ad2422f61544f314",
        ],
        tokens: [
            ADDRESSES.fantom.DAI,
            ADDRESSES.fantom.USDC,
            ADDRESSES.fantom.WBTC,
        ],
    },
    polygon: {
        owners: [
            "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
            "0xced734f47613e2484fd9ee6f76afcb866bc4d6fa",
            "0xd33492080f2d3a89ae500a3b3bc0e076713a3cbb",
            "0xf504e9a7511f1af03f8e8c6800a05fb9d43481f2",
            "0x1fa28c9cb44d2853afd0d932c3805221fab95a8b",
            "0x356b37e007564fd37b957f946a246871bf827ea2",
        ],
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
    ...Object.entries(config).reduce((acc, [chain, { owners, tokens }]) => {
        acc[chain] = { tvl: sumTokensExport({ owners, tokens }) }
        return acc
    }, {}),
}