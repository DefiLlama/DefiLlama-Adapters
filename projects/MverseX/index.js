const {getUniTVL} = require('../helper/unknownTokens')

module.exports = {

  misrepresentedTokens: true,

  kava:{

    tvl: getUniTVL({

      factory: '0xEFD3ad14E5cF09b0EbE435756337fb2e9D10Dc1a',

      fetchBalances: true,

      useDefaultCoreAssets: true,

      //hasStablePools: true,

    })

  },

}

