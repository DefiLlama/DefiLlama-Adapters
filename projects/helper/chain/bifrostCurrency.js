// Bifrost CurrencyId SCALE encoding/decoding (bifrost-primitives)
const { ScaleReader } = require('./substrate')

// CurrencyId enum variants
const CURRENCY = {
  Native: 0, VToken: 1, Token: 2, Stable: 3, VSToken: 4, VSBond: 5, LPToken: 6, ForeignAsset: 7,
  Token2: 8, VToken2: 9, VSToken2: 10, VSBond2: 11, StableLpToken: 12, BLP: 13, Lend: 14,
}
const VARIANT_NAMES = Object.fromEntries(Object.entries(CURRENCY).map(([name, id]) => [id, name]))

const TOKEN_SYMBOLS = { 0: 'ASG', 1: 'BNC', 2: 'KUSD', 3: 'DOT', 4: 'KSM', 5: 'ETH', 6: 'KAR', 7: 'ZLK', 8: 'PHA', 9: 'RMRK', 10: 'MOVR' }
const TOKEN_IDS = Object.fromEntries(Object.entries(TOKEN_SYMBOLS).map(([id, sym]) => [sym, +id]))

// TokenId (u8) based variants on bifrost-polkadot
const TOKEN2_SYMBOLS = { 0: 'DOT', 1: 'GLMR', 2: 'PARA', 3: 'ASTR', 4: 'FIL', 8: 'MANTA', 15: 'ETH' }

const encode = (variant, payload) => Buffer.from([CURRENCY[variant], payload])
const token = (symbol) => encode('Token', TOKEN_IDS[symbol])
const vToken = (symbol) => encode('VToken', TOKEN_IDS[symbol])
const vsToken = (symbol) => encode('VSToken', TOKEN_IDS[symbol])
const token2 = (id) => encode('Token2', id)
const vToken2 = (id) => encode('VToken2', id)
const vsToken2 = (id) => encode('VSToken2', id)

// reads one CurrencyId from a ScaleReader
// -> { variant, raw: Buffer, symbol?, id?, human } where `human` mirrors polkadot.js toHuman(), e.g. { Token: 'KSM' } or { VToken2: '0' }
function readCurrencyId(r) {
  const start = r.offset
  const variant = VARIANT_NAMES[r.u8()]
  let out = { variant }
  switch (variant) {
    case 'Native': case 'VToken': case 'Token': case 'Stable': case 'VSToken': {
      const symbol = TOKEN_SYMBOLS[r.u8()]
      out = { variant, symbol, human: { [variant]: symbol } }
      break
    }
    case 'Token2': case 'VToken2': case 'VSToken2': {
      const id = r.u8()
      out = { variant, id, symbol: TOKEN2_SYMBOLS[id], human: { [variant]: String(id) } }
      break
    }
    case 'VSBond': r.u8(); r.u32(); r.u32(); r.u32(); break            // (TokenSymbol, ParaId, LeasePeriod, LeasePeriod)
    case 'VSBond2': r.u8(); r.u32(); r.u32(); r.u32(); break           // (TokenId, ParaId, LeasePeriod, LeasePeriod)
    case 'LPToken': r.u8(); r.u8(); r.u8(); r.u8(); break              // (TokenSymbol, u8, TokenSymbol, u8)
    case 'ForeignAsset': case 'StableLpToken': case 'BLP': out = { variant, id: r.u32() }; break
    case 'Lend': out = { variant, id: r.u8() }; break
    default: throw new Error(`Unknown bifrost CurrencyId variant ${variant}`)
  }
  out.raw = r.buf.subarray(start, r.offset)
  return out
}

const decodeCurrencyId = (buf) => readCurrencyId(new ScaleReader(buf))

module.exports = {
  CURRENCY,
  TOKEN_SYMBOLS,
  TOKEN2_SYMBOLS,
  token,
  vToken,
  vsToken,
  token2,
  vToken2,
  vsToken2,
  readCurrencyId,
  decodeCurrencyId,
}
