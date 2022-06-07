const {getFactoryTvl} = require('../terraswap/factoryTvl')

const factory = "terra1u27ypputx3pu865luzs4fpjsj4llsnzf9qeq2p"

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    terra: {
        tvl: getFactoryTvl(factory)
    },
}
