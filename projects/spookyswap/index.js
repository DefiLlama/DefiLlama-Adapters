const { getUniTVL } = require("../helper/unknownTokens")
module.exports={
  misrepresentedTokens: true,
  fantom:{
      tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3' }),
  },
  eon:{
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xa6AD18C2aC47803E193F75c3677b14BF19B94883' }),
},
bittorrent: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xee4bc42157cf65291ba2fe839ae127e3cc76f741' }),
  }
}  