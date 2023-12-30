const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  start: 1692842880,
  base: {
    tvl: getUniTVL({ factory: '0x55b3409335B81E7A8B7C085Bbb4047DDc23f7257', useDefaultCoreAssets: true, }),
  },
};