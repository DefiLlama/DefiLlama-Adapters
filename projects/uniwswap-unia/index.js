const { masterchefExports } = require('../helper/unknownTokens')

module.exports = {
  arbitrum: masterchefExports({
    chain: 'arbitrum',
    masterchef: '0x231A584095dbFb73A0201d6573260Bc646566c98',
    useDefaultCoreAssets: true,
    nativeToken: '0xe547fab4d5ceafd29e2653cb19e6ae8ed9c8589b',
  }).arbitrum,
  ethpow: masterchefExports({
    chain: 'ethpow',
    masterchef: '0xC07707C7AC7E383CE344C090F915F0a083764C94',
    useDefaultCoreAssets: true,
    nativeToken: '0x2a0cf46ecaaead92487577e9b737ec63b0208a33',
  }).ethpow,
}

module.exports.misrepresentedTokens = true
module.exports.doublecounted = true