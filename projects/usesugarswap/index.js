const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x0A592988aBE9017a3c0285B9aa251A4bE8683394',
      useDefaultCoreAssets: true,
    })
  },
}; 