const { getUniTVL } = require('../helper/unknownTokens')

//Factory address can be visible here : https://woken-exchange.gitbook.io/wokenexchange/security/contracts-and-wallets
module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl: getUniTVL({ factory: '0x0Dee376e1DCB4DAE68837de8eE5aBE27e629Acd0', useDefaultCoreAssets: true, }), },
  bsc: { tvl: getUniTVL({ factory: '0x0Dee376e1DCB4DAE68837de8eE5aBE27e629Acd0', useDefaultCoreAssets: true, }), }
}
