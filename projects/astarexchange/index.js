const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Astar Exchange Tvl Calculation",
    astar: {
        tvl: getUniTVL({ factory: '0x95f506E72777efCB3C54878bB4160b00Cd11cd84', useDefaultCoreAssets: true }),
    }
}
