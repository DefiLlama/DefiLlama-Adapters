const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
    misrepresentedTokens: true,
    methodology: "PandoraswapFinance Tvl Calculation",
    astar: {
        tvl: calculateUsdUniTvl(
            "0x8D4f9b98FC21787382647BFCfC9ce75C08B50481",
            "astar",
            "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720",
            [
                "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98", // USDC
            ],
            "astar"
        ),
    },
};