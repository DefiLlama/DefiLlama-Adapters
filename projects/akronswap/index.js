const { getUniTVL } = require('../helper/unknownTokens');
  
module.exports = {
  misrepresentedTokens: true,
  ethereum:{
    tvl: getUniTVL({ factory: '0x6624Ac5F9abFA36174511607860e81C8dB9e84E9', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  arbitrum:{
    tvl: getUniTVL({ factory: '0x40Cbdf84475f8Dd7C9a9c665eDE551EeaaF21F8d', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  base:{
    tvl: getUniTVL({ factory: '0xD2156Bb9ed200FE88705443BfFcA788BA8b205f6', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  bsc:{
    tvl: getUniTVL({ factory: '0x40Cbdf84475f8Dd7C9a9c665eDE551EeaaF21F8d', useDefaultCoreAssets: true, fetchBalances: true, }),
  },      
}