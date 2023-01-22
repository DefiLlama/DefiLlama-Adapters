const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    polis: {
        tvl: getUniTVL({
            chain: 'polis',
            factory: '0x4523ad2e05c455d0043910c84c83236a6c98b40b',
            useDefaultCoreAssets: true,
        })
    },
}
