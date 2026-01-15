const { getUniTVL } = require("../helper/unknownTokens")
module.exports={
  goat:{
      tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xbF8c8B5D27e76890416eA95a50d4732BB4906741' }),
  },
}  
