const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  boba: {
    tvl: getUniTVL({
      factory: '0x7DDaF116889D655D1c486bEB95017a8211265d29',
      useDefaultCoreAssets: true,
    })
  },
  hallmarks: [
    ['2022-07-20', "Alameda Research exits"],
  ],
};
