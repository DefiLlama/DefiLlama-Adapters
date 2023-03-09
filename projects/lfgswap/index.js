const { getUniTVL } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      chain: 'ethpow',
      useDefaultCoreAssets: true,
      factory: '0xf66cef53c518659bFA0A9a4Aa07445AF08bf9B3a',
    })
  },/*
  core: {
    tvl: getUniTVL({
      chain: 'core',
      useDefaultCoreAssets: true,
      factory: '0xA1ADD165AED06D26fC1110b153ae17a5A5ae389e',
    })
  }*/
}