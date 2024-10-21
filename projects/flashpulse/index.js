const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  pulse: { tvl: getUniTVL({ factory: '0xD2871d0d39A9cb0cB0505309A5C1F521df25a987', useDefaultCoreAssets: true, }), },
}