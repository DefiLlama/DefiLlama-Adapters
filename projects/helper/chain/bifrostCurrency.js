// Bifrost CurrencyId SCALE encoding/decoding (bifrost-primitives), implemented in @defillama/sdk (`sdk.chains.substrate.bifrost`)
const { bifrost } = require('@defillama/sdk').chains.substrate

module.exports = {
  CURRENCY: bifrost.CURRENCY,
  TOKEN_SYMBOLS: bifrost.TOKEN_SYMBOLS,
  TOKEN2_SYMBOLS: bifrost.TOKEN2_SYMBOLS,
  token: bifrost.token,
  vToken: bifrost.vToken,
  vsToken: bifrost.vsToken,
  token2: bifrost.token2,
  vToken2: bifrost.vToken2,
  vsToken2: bifrost.vsToken2,
  // -> { variant, raw: Buffer, symbol?, id?, human } where `human` mirrors polkadot.js toHuman(), e.g. { Token: 'KSM' } or { VToken2: '0' }
  readCurrencyId: bifrost.readCurrencyId,
  decodeCurrencyId: bifrost.decodeCurrencyId,
}
