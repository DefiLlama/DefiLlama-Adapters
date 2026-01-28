const { sumTokensExport } = require("../helper/sumTokens")

const owners = [
    "0x172d2ab563afdaace7247a6592ee1be62e791165", // ctUSD-USDC.e 
    "0x5d4b518984ae9778479ee2ea782b9925bbf17080", // ctUSD-cBTC
    "0xaea5cf09209631b6a3a69d5798034e2efdbe2cc8", // cBTC-WBTC.e
    "0xb22325fe6e033c6b7cefb7bc69c9650ffdc691f9", // ctUSD-GUSD
    "0xa82eee40f1c88d773c93771d5b1fac61db311945", // cBTC-USDC.e
]

const tokens = [
    "0x3100000000000000000000000000000000000006", // cBTC
    "0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D", // citreaUSD
    "0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839", // USDC.e
    "0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4", // USDT.e
    "0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d", // WBTC.e
]

module.exports = {
    citrea: {
        tvl: sumTokensExport({ owners, tokens }),
    },
    methodology: "TVL counts the total liquidity on Satsuma's citrea pools.",
}