const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  start: '2023-08-24',
  base: {
    tvl: getUniTVL({ factory: '0x55b3409335B81E7A8B7C085Bbb4047DDc23f7257', useDefaultCoreAssets: true, }),
  },
};