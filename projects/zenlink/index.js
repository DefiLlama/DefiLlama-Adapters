const { calculateUsdTvl } = require('./getUsdTvl')
const stakeList = [
    '0xA6f95CDf64A579C40A455D06F2f225481bDfaAeA'
];

const tokenChainMap = {
    '0x3b25bc1dc591d24d60560d0135d6750a561d4764': '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab', // vETH
}

module.exports = {
    misrepresentedTokens: true,
    moonriver: {
        tvl: calculateUsdTvl(
            "0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D",
            "moonriver",
            stakeList,
            tokenChainMap,
            true
            ),
    }
}
