const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const FACTORIES = "0x4346A7C8C39Bf91b8a80933c2fdb10d815c401dB"

const NATIVE_TOKEN_WASTAR = "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720"

const TOKENS = {
    WASTAR: NATIVE_TOKEN_WASTAR,
    VERSA: "0xB9dEDB74bd7b298aBf76b9dFbE5b62F0aB05a57b",
    USDC: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
    BUSD: "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E",
}

const tvl = calculateUsdUniTvl(
    FACTORIES,
    "astar",
    NATIVE_TOKEN_WASTAR,
    [
        ...Object.values(TOKENS)
    ], "astar")

module.exports = {
    timetravel: true,
    methodology: "Versa Tvl Calculation",
    astar: { tvl }
}
