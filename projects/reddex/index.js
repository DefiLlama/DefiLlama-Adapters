const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({ factory: '0xBC7D212939FBe696e514226F3FAfA3697B96Bf59', useDefaultCoreAssets: true }),
  },
  redbelly: {
    tvl: getUniTVL({ factory: '0x2E592dF6c56a8720E46bB00D17f8FaB391BF97c8', useDefaultCoreAssets: true }),
  },
  bsc: {
    tvl: getUniTVL({ factory: '0x6D642253B6fD96d9D155279b57B8039675E49D8e', useDefaultCoreAssets: true }),
  },
};
