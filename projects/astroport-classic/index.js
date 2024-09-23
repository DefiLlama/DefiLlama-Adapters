const { getFactoryTvl } = require('../terraswap/factoryTvl')

module.exports = {
    deadFrom: '2022-07-01',
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    terra: {
        tvl: getFactoryTvl("terra1fnywlw4edny3vw44x04xd67uzkdqluymgreu7g",)
    },
    hallmarks: [
        [1651881600, "UST depeg"],
    ]
}
