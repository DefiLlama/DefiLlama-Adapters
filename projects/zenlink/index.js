const { calculateUsdTvl } = require('./getUsdTvl')
const stakeList = [
    '0xA6f95CDf64A579C40A455D06F2f225481bDfaAeA'
];

module.exports = {
    misrepresentedTokens: true,
    moonriver: {
        tvl: calculateUsdTvl(
            "0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D",
            "moonriver",
            stakeList,
            ),
    }
}
