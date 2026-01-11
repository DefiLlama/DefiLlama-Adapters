const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    xlayer: {
        tvl: getUniTVL({
            factory: '0xF1cBfB1b12408dEDbA6Dcd7BB57730bAef6584fB',
            useDefaultCoreAssets: true,
        }),
    },
}
