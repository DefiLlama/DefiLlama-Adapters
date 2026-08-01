const { getUniTVL } = require('../helper/unknownTokens.js')

const config = {
  scroll: '0x23537BCe0533e53609A49dffdd400e54A825cb81',
  arbitrum: '0xdAF8b79B3C46db8bE754Fc5E98b620ee243eb279',
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, hasStablePools: true, })
  }
})