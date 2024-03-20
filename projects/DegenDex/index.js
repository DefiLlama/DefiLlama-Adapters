const { getUniTVL } = require('../helper/unknownTokens')

module.exports = { 
 bsc: {
    tvl: getUniTVL({ factory: "0x858FdBfD94C298D511F5Fb839d1f59eb1d8840D2", useDefaultCoreAssets: true,})
  },
 dogechain: {
    tvl: getUniTVL({ factory: "0xfc5F561aa36D4f85BfA9A89Dbf058932223d43dB", useDefaultCoreAssets: true,})
  }
}