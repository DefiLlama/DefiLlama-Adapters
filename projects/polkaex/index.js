const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { stakings } = require("../helper/staking");
const sdk = require("@defillama/sdk");

const FACTORIES = {
    shiden: "0x20c05B9D6546e60556dE510D58ac100783ad46B1",
    bsc: "0x6797F1468007e0A7720a17ceD2D47350B45E26e5",
    ethereum: "0x0Af64bDA476628251dd9F88c9b0CA0b5DB17BFc1"
}

const NATIVE_TOKENS = {
    WSDN: "0x0f933Dc137D21cA519ae4C7E93f87a4C8EF365Ef",
    WBNB: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
}

const TOKENS = {
    shiden: {
        USDC: "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
        USDT: "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
        JPYC: "0x735aBE48e8782948a37C7765ECb76b98CdE97B0F",
        BNB: "0x332730a4f6e03d9c55829435f10360e13cfa41ff",
        BUSD: "0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a",
        ETH: "0x765277EebeCA2e31912C9946eAe1021199B39C61",
        WSDN: NATIVE_TOKENS.WSDN
    },
    bsc: {
        BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        WBNB: NATIVE_TOKENS.WBNB
    },
    ethereum: {
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        WETH: NATIVE_TOKENS.WETH
    }
}

const PKEX = {
    shiden: "0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98",
    ethereum: "0xe6f143a0e0a8f24f6294ce3432ea10fad0206920",
    bsc: "0x68edF56289134b41C6583c0e8fc29fbD7828aCa4",
    polygon: "0xd13eB71515DC48a8a367D12F844e5737bab415dF"
}

const STAKING_CONTRACTS = {
    shiden: [
        "0xC9e3Ca62B14818D23D29E658888c03A61bE22AB6",
        "0x4d4B492aF3EE600fc6c4B6Ee7C4c4100C9b58B16",
        "0x1d069E6297b8200915Fce5bf2E85Ee7Cb4fA7008",
    ],
    bsc: [
        "0xE9D6d7FC069EA3ec7232428Be314C9B1734671f5",
        "0x9628B9E1a48Dc573e857D6c8b0aFB0c4965B29aA"
    ],
    polygon: [
        "0x8526797627E83c2609213aE74F2Ffc3aAeFa124B"
    ]
}

const tvls = {
    shiden: calculateUsdUniTvl(
        FACTORIES.shiden,
        "shiden",
        NATIVE_TOKENS.WSDN,
        [
            ...Object.values(TOKENS.shiden),
            PKEX.shiden
        ], "shiden"),
    bsc: calculateUsdUniTvl(
        FACTORIES.bsc,
        "bsc",
        NATIVE_TOKENS.WBNB,
        [
            ...Object.values(TOKENS.bsc),
            PKEX.bsc
        ], "wbnb"),
    ethereum: calculateUsdUniTvl(
        FACTORIES.ethereum,
        "ethereum",
        NATIVE_TOKENS.WETH,
        [
            ...Object.values(TOKENS.ethereum),
            PKEX.ethereum
        ],
        "weth"
    ),
    polygon: async () => 0,
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "PolkaEx Tvl Calculation",
    shiden: {
        tvl: tvls.shiden,
        staking: stakings(
            STAKING_CONTRACTS.shiden,
            PKEX.shiden,
            "shiden",
            PKEX.ethereum
        ),
    },
    bsc: {
        tvl: tvls.bsc,
        staking: stakings(
            STAKING_CONTRACTS.bsc,
            PKEX.bsc,
            "bsc",
            PKEX.ethereum
        ),
    },
    polygon: {
        tvl: tvls.polygon,
        staking: stakings(
            STAKING_CONTRACTS.polygon,
            PKEX.polygon,
            "polygon",
            // PKEX.ethereum
        ),
    },
    ethereum: {
        tvl: tvls.ethereum
    },
    tvl: sdk.util.sumChainTvls(Object.values(tvls))
}