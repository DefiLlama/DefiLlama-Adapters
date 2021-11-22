const { calculateUsdTvl } = require('./getUsdTvl')
const stakeList = [
    '0xA6f95CDf64A579C40A455D06F2f225481bDfaAeA'
];

module.exports = {
    methodology: "Get all pairs from the Factory Contract(0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D) then get the reserve0 token amount and reserve1 token amount in one pair. Update the total balance of each token by reserve0 and reserve1. Repeat 2 ~ 3 for each pairs. Get all token and amount from the Stake Contract list Update the total balance of each token by the stake amout and get the total TVL of Zenlink DEX.",
    misrepresentedTokens: true,
    moonriver: {
        tvl: calculateUsdTvl(
            "0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D",
            "moonriver",
            stakeList,
            ),
    }
}
