const { getUniTVL } = require('../helper/unknownTokens');
  
module.exports = {
  misrepresentedTokens: true,
  ethereum:{
    tvl: getUniTVL({ factory: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  arbitrum:{
    tvl: getUniTVL({ factory: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  base:{
    tvl: getUniTVL({ factory: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  bsc:{
    tvl: getUniTVL({ factory: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4', useDefaultCoreAssets: true, fetchBalances: true, }),
  },      
}