const { getUniTVL } = require('../helper/unknownTokens')
const config = {
  bsc: '0x858FdBfD94C298D511F5Fb839d1f59eb1d8840D2',
  dogechain: '0xfc5F561aa36D4f85BfA9A89Dbf058932223d43dB',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true,})
  }
})
