const { calculateUsdTvl } = require('./getUsdTvl')

const wMOVR = "0x98878B06940aE243284CA214f92Bb71a2b032B8A" // their own barely used version

module.exports = {
    misrepresentedTokens: true,
    moonriver: {
        tvl: calculateUsdTvl("0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D", "moonriver", wMOVR,
            [
                '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // USDC
                // '0xb44a9b6905af7c801311e8f4e76932ee959c663c', // USDT
                // '0x5d9ab5522c64e1f6ef5e3627eccc093f56167818', // BUSD
            ], "moonriver"),
    }
}
