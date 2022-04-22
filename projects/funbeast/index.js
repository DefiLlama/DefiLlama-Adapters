const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl');

module.exports = {
    misrepresentedTokens: true,
    methodology: "Astar Exchange Tvl Calculation",
    astar: {
        tvl: calculateUsdUniTvl(
            "0xb99978440F310658C5E69D5042724327EF6D3CE7", 
            "astar", 
            "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720",
            [
                '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98', // USDC
            ], 
            "astar"),
    }
};
