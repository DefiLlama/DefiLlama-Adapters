const BigNumber = require('bignumber.js')

BigNumber.config({
  EXPONENTIAL_AT: 1e9,
  DECIMAL_PLACES: 80,
  ROUNDING_MODE: BigNumber.ROUND_FLOOR,
})

const PRECISE_NUMBER_DECIMALS = 12
const PRECISE_NUMBER_SCALE = new BigNumber(10).pow(PRECISE_NUMBER_DECIMALS)
const FRACTION_SCALE = new BigNumber(2).pow(60)

function bnToBigInt(value) {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(value)
  if (typeof value === 'string') return BigInt(value)
  if (value == null) return 0n
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === 'number')) {
      let result = 0n
      value.forEach((byte, index) => {
        result += BigInt(byte) << BigInt(index * 8)
      })
      return result
    }
    if (value.length === 1) return bnToBigInt(value[0])
  }
  if (value[0] != null) return bnToBigInt(value[0])
  return BigInt(value.toString())
}

function bnToNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (value == null) return 0
  return Number(value.toString())
}

function toDecimal(value) {
  if (value instanceof BigNumber) return value
  return new BigNumber(value == null ? 0 : value.toString())
}

function decimalFloorToBigInt(value) {
  return BigInt(toDecimal(value).integerValue(BigNumber.ROUND_FLOOR).toFixed(0))
}

function preciseNumberPartsToRaw(parts) {
  let values = parts
  while (values && !Array.isArray(values) && values[0] != null) values = values[0]
  while (Array.isArray(values) && values.length === 1 && (Array.isArray(values[0]) || values[0]?.[0] != null)) {
    values = values[0]
  }
  if (values && !Array.isArray(values) && values[0] != null) values = values[0]
  if (!Array.isArray(values)) return 0n

  let raw = 0n
  for (let i = 0; i < values.length; i += 1) {
    raw += bnToBigInt(values[i]) << BigInt(i * 64)
  }
  return raw
}

function preciseNumberPartsToDecimal(parts) {
  return new BigNumber(preciseNumberPartsToRaw(parts).toString()).div(PRECISE_NUMBER_SCALE)
}

function preciseNumberPartsToNumber(parts) {
  return Number(preciseNumberPartsToDecimal(parts).toString())
}

function fractionToDecimal(value) {
  return toDecimal(value).div(FRACTION_SCALE)
}

function priceEntryToDecimal(entry) {
  return preciseNumberPartsToDecimal(entry.price)
}

function getPriceIds(priceId) {
  if (priceId?.simple) return [bnToBigInt(priceId.simple.priceId)]
  if (priceId?.multiply) return priceId.multiply.priceIds.map(bnToBigInt)
  throw new Error('Unknown PriceId variant')
}

function resolvePrice(priceId, prices) {
  const ids = getPriceIds(priceId)
  if (ids.length === 0) throw new Error('PriceId cannot be empty')

  let value = null
  for (const id of ids) {
    const entry = prices.prices[Number(id)]
    if (!entry) throw new Error(`Price not found for id ${id}`)
    const price = priceEntryToDecimal(entry)
    value = value === null ? price : value.times(price)
  }

  return value
}

function resolveTailPrice(priceId, prices) {
  const ids = getPriceIds(priceId)
  const tail = ids[ids.length - 1]
  const entry = prices.prices[Number(tail)]
  if (!entry) throw new Error(`Price not found for id ${tail}`)
  return priceEntryToDecimal(entry)
}

function getPriceInputMint(priceId, prices) {
  const ids = getPriceIds(priceId)
  const entry = prices.prices[Number(ids[ids.length - 1])]
  if (!entry) throw new Error(`Price not found for id ${ids[ids.length - 1]}`)
  return entry.priceMint
}

function deriveYtPriceInBase(syPrice, syExchangeRate, ptPrice) {
  if (syExchangeRate.lte(0)) throw new Error('SY exchange rate must be positive')
  const value = syPrice.div(syExchangeRate).minus(ptPrice)
  return BigNumber.max(value, 0)
}

function parseTokenAccountAmount(data) {
  const buffer = Buffer.from(data)
  if (buffer.length < 72) throw new Error('SPL token account data too short')
  return buffer.readBigUInt64LE(64)
}

module.exports = {
  BigNumber,
  bnToBigInt,
  bnToNumber,
  decimalFloorToBigInt,
  deriveYtPriceInBase,
  fractionToDecimal,
  getPriceIds,
  getPriceInputMint,
  parseTokenAccountAmount,
  preciseNumberPartsToDecimal,
  preciseNumberPartsToNumber,
  preciseNumberPartsToRaw,
  priceEntryToDecimal,
  resolvePrice,
  resolveTailPrice,
  toDecimal,
}
