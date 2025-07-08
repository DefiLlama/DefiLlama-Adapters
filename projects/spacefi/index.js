const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  evmos: {
    tvl: getUniTVL({
      factory: '0x868A71EbfC46B86a676768C7b7aD65055CC293eE',
      useDefaultCoreAssets: true,
    })
  }
};
