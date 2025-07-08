const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  dogechain: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xf1036CA4762cD601BDc630cd32942f90d19ED970',
    }),
  },
}
