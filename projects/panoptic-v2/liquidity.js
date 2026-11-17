const { getSqrtPriceX96AtTick } = require('../helper/utils/tick')

const Q96 = 1n << 96n
const UINT128_MASK = (1n << 128n) - 1n

function decodeChunks(tokenId, owner) {
  tokenId = BigInt(tokenId)
  const poolId = tokenId & ((1n << 64n) - 1n)
  const spacing = Number(poolId >> 48n)
  const chunks = []
  for (let index = 0n; index < 4n; index++) {
    const leg = tokenId >> (64n + index * 48n)
    const ratio = (leg >> 1n) & 127n
    const width = Number((leg >> 36n) & 4095n)
    if (ratio === 0n || width === 0) continue
    const strike = Number(BigInt.asIntN(24, leg >> 12n))
    const tickLower = strike - Math.floor(width * spacing / 2)
    const tickUpper = strike + Math.ceil(width * spacing / 2)
    if (!spacing || tickLower < -887272 || tickUpper > 887272 || tickLower >= tickUpper)
      throw new Error(`Invalid SFPM range for token ${tokenId}`)
    chunks.push({ poolId: poolId.toString(), owner: owner.toLowerCase(), tokenType: Number((leg >> 9n) & 1n), tickLower, tickUpper })
  }
  return chunks
}

function inventory(balance, sqrtPriceX96, tickLower, tickUpper) {
  const liquidity = BigInt(balance) & UINT128_MASK
  const lower = getSqrtPriceX96AtTick(tickLower)
  const upper = getSqrtPriceX96AtTick(tickUpper)
  const price = BigInt(sqrtPriceX96)
  if (price <= 0n) throw new Error('Uninitialized SFPM underlying pool')
  const current = price < lower ? lower : price > upper ? upper : price
  return [
    liquidity * Q96 * (upper - current) / (current * upper),
    liquidity * (current - lower) / Q96,
  ]
}

module.exports = { decodeChunks, inventory }
