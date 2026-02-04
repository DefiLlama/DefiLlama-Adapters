const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    misrepresentedTokens: true,
    iotex: {
      tvl: getUniTVL({ factory: '0xda257cBe968202Dea212bBB65aB49f174Da58b9D', useDefaultCoreAssets: true }),
    },
};