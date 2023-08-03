const { getUniTVL } = require("../helper/unknownTokens")
module.exports={
  misrepresentedTokens: true,
  fantom:{
      tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3' }),
  },
}  