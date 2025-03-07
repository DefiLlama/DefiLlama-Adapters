const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  manta: { tvl: getUniTVL({ factory: '0x31a78894a2B5dE2C4244cD41595CD0050a906Db3', useDefaultCoreAssets: true, }) }
}