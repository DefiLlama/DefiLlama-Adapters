const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  shibarium: { tvl: getUniTVL({ factory: '0x09aBAdE821e55d7944965688eA6699a9830BAE45', useDefaultCoreAssets: true,  }), },
  op_bnb: { tvl: getUniTVL({ factory: '0x9946468d90DE3fD885b7FEE9BF73a956Dc363349', useDefaultCoreAssets: true,  }), },
}
