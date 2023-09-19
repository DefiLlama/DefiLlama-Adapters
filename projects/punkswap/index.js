const { getUniTVL } = require('../helper/unknownTokens')
const { stakings } = require('../helper/staking')

module.exports = {

    misrepresentedTokens: true,
      shibarium: {
      staking: stakings("0x336726832bbE10FBED4C80Bc201F728B1404B073", "shibarium"),
      tvl: getUniTVL({ factory: '0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90', useDefaultCoreAssets: true, })
    },

    op_bnb: {
      tvl: getUniTVL({ factory: '0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90', useDefaultCoreAssets: true, })
    }

}