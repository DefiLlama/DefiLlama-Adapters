const { sumTokens2: sumEvmTokens } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

const ethTrustForwarder = [
    '0x20F780A973856B93f63670377900C1d2a50a77c4',
]

const baseTrustForwarder = [
    '0xa39A5f160a1952dDf38781Bd76E402B0006912A9',
]

const arbitrumTrustForwarder = [
    '0x18cd9270DbdcA86d470cfB3be1B156241fFfA9De',
]

const polygonTrustForwarder = [
    '0xEAF5453b329Eb38Be159a872a6ce91c9A8fb0260',
]

const bscTrustForwarder = [
    '0xb3e3DfCb2d9f3DdE16d78B9e6EB3538Eb32B5ae1',
]

module.exports = {
    ethereum: {
        tvl: () => sumEvmTokens({
            owners: ethTrustForwarder,
            tokens: [
                ADDRESSES.null,
                ADDRESSES.ethereum.WETH
            ],
            chain: 'ethereum'
        })
    },
    base: {
        tvl: () => sumEvmTokens({
            owners: baseTrustForwarder,
            tokens: [
                ADDRESSES.null
            ],
            chain: 'base'
        })
    },
    arbitrum: {
        tvl: () => sumEvmTokens({
            owners: arbitrumTrustForwarder,
            tokens: [
                ADDRESSES.null,
                ADDRESSES.arbitrum.WETH
            ],
            chain: 'arbitrum'
        })
    },
    polygon: {
        tvl: () => sumEvmTokens({
            owners: polygonTrustForwarder,
            tokens: [
                ADDRESSES.null,
                ADDRESSES.polygon.USDC,
                ADDRESSES.polygon.USDT,
                ADDRESSES.polygon.WETH_1
            ],
            chain: 'polygon'
        })
    },
    bsc: {
        tvl: () => sumEvmTokens({
            owners: bscTrustForwarder,
            tokens: [
                ADDRESSES.null,
                ADDRESSES.bsc.USDC,
                ADDRESSES.bsc.USDT,
                ADDRESSES.bsc.WBNB
            ],
            chain: 'bsc'
        })
    }
};