const REFERENCE_ASSETS = {};
const coins = {};
const pools = [
    {
        id: 'CLEV/ETH',
        name: 'CLEV/ETH',
        coins: [
            coins.weth,
            coins.clev,
        ],
        fromPlatform: "Curve",
        addresses: {
            poolAddress: '0x342D1C4Aa76EA6F5E5871b7f11A019a0eB713A4f',
            token: '0x6C280dB098dB673d30d5B34eC04B6387185D3620',
            gauge: '0x86e917ad6Cb44F9E6C8D9fA012acF0d0CfcF114f',
        },
    }    
]
module.exports = { pools };