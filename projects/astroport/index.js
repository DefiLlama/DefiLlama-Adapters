const {getFactoryTvl} = require('../terraswap/factoryTvl')

const factory = "terra1fnywlw4edny3vw44x04xd67uzkdqluymgreu7g"

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    tvl: getFactoryTvl(factory)
}