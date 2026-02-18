const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  pulse: {
    tvl: getUniTVL({ factory: '0x29ea7545def87022badc76323f373ea1e707c523', useDefaultCoreAssets: true, permitFailure: true, queryBatched: 2000 }),
  },
};