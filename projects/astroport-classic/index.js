const { getFactoryTvl } = require('../terraswap/factoryTvl')

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    terra: {
        tvl: getFactoryTvl("terra1fnywlw4edny3vw44x04xd67uzkdqluymgreu7g",)
    },
    hallmarks: [
        [1651881600, "UST depeg"],
    ]
} // node test.js projects/astroport/index.js
