const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    scroll: {
    tvl: getUniTVL({ factory: '0xa63eb44c67813cad20A9aE654641ddc918412941', useDefaultCoreAssets: true, })
  }
};