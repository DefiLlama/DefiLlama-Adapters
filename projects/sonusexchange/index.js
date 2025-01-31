const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  soneium: { tvl: getUniTVL({ factory: '0xdb5D9562C80AEab3aeaED35ecaAe40Fd8DC9a4c8', useDefaultCoreAssets: true, }), },
}