const {getUniTVL} = require('../helper/unknownTokens')

module.exports = {
    fantom: {
        tvl: getUniTVL({
            factory: '0xD9473A05b2edf4f614593bA5D1dBd3021d8e0Ebe',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        })
    }
}
