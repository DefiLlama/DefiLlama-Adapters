const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { stakings } = require("../helper/staking");

const FACTORIES = {
    astar: "0x1E66b3e7141bDF8c414F91269a3A99d098D2d356",
    shiden: "0x20c05B9D6546e60556dE510D58ac100783ad46B1",
    bsc: "0x6797F1468007e0A7720a17ceD2D47350B45E26e5",
    ethereum: "0x0Af64bDA476628251dd9F88c9b0CA0b5DB17BFc1"
}

const NATIVE_TOKENS = {
    WASTAR: "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720",
    WSDN: ADDRESSES.shiden.WSDN,
    WBNB: ADDRESSES.bsc.WBNB,
    WETH: ADDRESSES.ethereum.WETH
}

const TOKENS = {
    astar: {
        USDC: ADDRESSES.moonbeam.USDC,
        USDT: ADDRESSES.astar.USDT,
        DOT: ADDRESSES.astar.DOT,
        WASTAR: NATIVE_TOKENS.WASTAR,
    },
    shiden: {
        // KAC: ADDRESSES.harmony.AVAX,
        STND: ADDRESSES.shiden.STND,
        USDC: ADDRESSES.telos.ETH,
        USDT: ADDRESSES.telos.USDC,
        JPYC: ADDRESSES.shiden.JPYC,
        BNB: ADDRESSES.dogechain.BUSD,
        BUSD: ADDRESSES.shiden.BUSD,
        ETH: ADDRESSES.shiden.ETH,
        WSDN: NATIVE_TOKENS.WSDN
    },
    bsc: {
        BUSD: ADDRESSES.bsc.BUSD,
        WBNB: NATIVE_TOKENS.WBNB
    },
    ethereum: {
        USDC: ADDRESSES.ethereum.USDC,
        WETH: NATIVE_TOKENS.WETH
    }
}

const PKEX = {
    astar: "0x1fE622E91e54D6AD00B01917351Ea6081426764A",
    shiden: ADDRESSES.dogechain.MATIC,
    ethereum: "0xe6f143a0e0a8f24f6294ce3432ea10fad0206920",
    bsc: "0x68edF56289134b41C6583c0e8fc29fbD7828aCa4",
    polygon: "0xd13eB71515DC48a8a367D12F844e5737bab415dF"
}

const STAKING_CONTRACTS = {
    astar: [
        "0xC8f9d27B4e5E9c956c7344C87D2eF05381D89Fc9",
        "0x517066B4D6eE14Ea8f8BF3A422b88dB95CE4C333",
        "0x8986CD046741CBfEe8F36a1dCD2af7C2a4942F1A",
        "0x6B44EF63fe77C56478a191bC1673E24e0408a780",
    ],
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
    astar: getUniTVL({ factory: FACTORIES.astar, useDefaultCoreAssets: true, }),
    shiden: getUniTVL({ factory: FACTORIES.shiden, useDefaultCoreAssets: true, }),
    bsc: getUniTVL({ factory: FACTORIES.bsc, useDefaultCoreAssets: true, }),
    ethereum: getUniTVL({ factory: FACTORIES.ethereum, useDefaultCoreAssets: true, }),
    polygon: async () => 0,
}

module.exports = {
        misrepresentedTokens: true,
    methodology: "PolkaEx Tvl Calculation",
    astar: {
        tvl: tvls.astar,
        staking: async (timestamp, _ethBlock, chainBlocks) => {
            const pkexStaking = await stakings(
                STAKING_CONTRACTS.astar,
                PKEX.astar,
                "astar",
                PKEX.ethereum
            )(timestamp, _ethBlock, chainBlocks);

            const dotStaking = await stakings(
                STAKING_CONTRACTS.astar,
                TOKENS.astar.DOT,
                "astar"
            )(timestamp, _ethBlock, chainBlocks);

            const result = { ...pkexStaking, ...dotStaking };
            return result;
        },
    },
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
};
