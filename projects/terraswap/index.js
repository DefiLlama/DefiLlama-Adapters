const {getFactoryTvl} = require('./factoryTvl')

const factory = "terra1ulgw0td86nvs4wtpsc80thv6xelk76ut7a7apj"

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    tvl: getFactoryTvl(factory)
}