const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0xdCBA2077FE5261753AB29Cc886Bd5CFe1786a7D6',
      useDefaultCoreAssets: true,
    })
  },
};