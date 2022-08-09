const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    polis: {
        tvl: getUniTVL({
            chain: 'polis',
            factory: '0x4523ad2e05c455d0043910c84c83236a6c98b40b',
            coreAssets: [
                '0x6fc851b8d66116627fb1137b9d5fe4e2e1bea978', // WPOLIS
            ]
        })
    },
}
