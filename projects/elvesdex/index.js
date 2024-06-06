const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  alv: {
    tvl: getUniTVL({ factory: '0xcadB0365436cbdB05D71C355F209AdaB214D8Dab', useDefaultCoreAssets: true, permitFailure: true }),
  }
};
