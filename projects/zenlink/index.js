const { calculateUsdTvl, calculateMoonriverTvl } = require('./getUsdTvl')

const tokenChainMap = {
    '0x3b25bc1dc591d24d60560d0135d6750a561d4764': '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab', // vETH
}

module.exports = {
    methodology: "Get all pairs from the Factory Contract then get the reserve0 token amount and reserve1 token amount in one pair. Update the total balance of each token by reserve0 and reserve1. Repeat 2 ~ 3 for each pairs.",
    misrepresentedTokens: true,
    moonriver: {
        tvl: calculateMoonriverTvl(
            "0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D",
            "moonriver",
            tokenChainMap,
            true
        )
    },
    moonbeam: {
        tvl: calculateUsdTvl(
            "0xF49255205Dfd7933c4D0f25A57D40B1511F92fEF",
            "moonbeam",
            "0xacc15dc74880c9944775448304b263d191c6077f",
            [
                "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9",
                "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
                "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594",
                "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c",
                "0x6a2d262d56735dba19dd70682b39f6be9a931d98"
            ],
            true,
            "moonbeam"
        )
    }
}
