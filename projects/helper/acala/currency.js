// SCALE codec for Acala/Karura CurrencyId, plus the same string form polkadot.js `toJSON()` produced
// so token keys stay identical to what the adapters emitted before moving to raw HTTP storage reads.
const { ScaleReader, encodeU8, encodeU16, encodeU32 } = require('../chain/substrate')
const { getCoreAssets } = require('../tokenMapping')

const TOKEN_SYMBOLS = {
  0: 'ACA', 1: 'AUSD', 2: 'DOT', 3: 'LDOT', 4: 'TAP',
  128: 'KAR', 129: 'KUSD', 130: 'KSM', 131: 'LKSM', 132: 'TAI',
  168: 'BNC', 169: 'VSKSM', 170: 'PHA', 171: 'KINT', 172: 'KBTC',
}
const TOKEN_IDS = Object.fromEntries(Object.entries(TOKEN_SYMBOLS).map(([id, sym]) => [sym, +id]))

// CurrencyId enum variants
const CURRENCY = { Token: 0, DexShare: 1, Erc20: 2, StableAssetPoolToken: 3, LiquidCrowdloan: 4, ForeignAsset: 5 }
// DexShare enum variants
const DEX_SHARE = { Token: 0, Erc20: 1, LiquidCrowdloan: 2, ForeignAsset: 3, StableAssetPoolToken: 4 }

const token = (symbol) => Buffer.concat([encodeU8(CURRENCY.Token), encodeU8(TOKEN_IDS[symbol])])
const foreignAsset = (id) => Buffer.concat([encodeU8(CURRENCY.ForeignAsset), encodeU16(id)])
const stableAssetPoolToken = (id) => Buffer.concat([encodeU8(CURRENCY.StableAssetPoolToken), encodeU32(id)])
const liquidCrowdloan = (lease) => Buffer.concat([encodeU8(CURRENCY.LiquidCrowdloan), encodeU32(lease)])

function readDexShare(r) {
  const variant = r.u8()
  switch (variant) {
    case DEX_SHARE.Token: return { token: TOKEN_SYMBOLS[r.u8()] }
    case DEX_SHARE.Erc20: return { erc20: '0x' + r.bytes(20).toString('hex') }
    case DEX_SHARE.LiquidCrowdloan: return { liquidCrowdloan: r.u32() }
    case DEX_SHARE.ForeignAsset: return { foreignAsset: r.u16() }
    case DEX_SHARE.StableAssetPoolToken: return { stableAssetPoolToken: r.u32() }
    default: throw new Error(`Unknown DexShare variant ${variant}`)
  }
}

// reads one CurrencyId from a ScaleReader and returns the polkadot.js toJSON() shape
function readCurrencyId(r) {
  const variant = r.u8()
  switch (variant) {
    case CURRENCY.Token: return { token: TOKEN_SYMBOLS[r.u8()] }
    case CURRENCY.DexShare: return { dexShare: [readDexShare(r), readDexShare(r)] }
    case CURRENCY.Erc20: return { erc20: '0x' + r.bytes(20).toString('hex') }
    case CURRENCY.StableAssetPoolToken: return { stableAssetPoolToken: r.u32() }
    case CURRENCY.LiquidCrowdloan: return { liquidCrowdloan: r.u32() }
    case CURRENCY.ForeignAsset: return { foreignAsset: r.u16() }
    default: throw new Error(`Unknown CurrencyId variant ${variant}`)
  }
}

const decodeCurrencyId = (buf) => readCurrencyId(new ScaleReader(buf))

// same naming as the old polkadot.js based helpers: core asset symbol as-is, otherwise `${chain}:${json without braces/quotes}`
function currencyName(chain, currencyJson) {
  const coreAssets = getCoreAssets(chain)
  if (currencyJson.token && coreAssets.includes(currencyJson.token.toLowerCase())) return currencyJson.token
  return chain + ':' + JSON.stringify(currencyJson).replace(/(\{|\}|\s|")/g, '')
}

module.exports = {
  TOKEN_SYMBOLS,
  token,
  foreignAsset,
  stableAssetPoolToken,
  liquidCrowdloan,
  readCurrencyId,
  decodeCurrencyId,
  currencyName,
}
