const { calculateUsdTvl, calculateMoonriverTvl } = require('./getUsdTvl')

const tokenChainMap = {
    '0x3b25bc1dc591d24d60560d0135d6750a561d4764': '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab', // vETH
}


const MoonbeamStableSwapContractAddress = [
    '0x435a35Fc175be0ba097A7bF43128C020EC5bb151', // 4pool
    '0x944Af4Fb58beDBcE86FB533Bd6DDc49C0BcA6793' // mad3pool/4pool
  ];

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
                "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9", // madUSDC
                "0xc234a67a4f840e61ade794be47de455361b52413", // madDAI
                "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594", //madUSDT
                "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", // anyUSDC
                "0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73", // anyUSDT
                "0x765277eebeca2e31912c9946eae1021199b39c61", // anyDAI
                "0x322e86852e492a7ee17f28a78c663da38fb33bfb", // FRAX
                "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c", // ceUSDT
                "0x6a2d262d56735dba19dd70682b39f6be9a931d98" // ceUSDC
            ],
            true,
            "moonbeam",
            18,
            MoonbeamStableSwapContractAddress
        )
    }
}
