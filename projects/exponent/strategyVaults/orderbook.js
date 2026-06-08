const { PublicKey } = require('@solana/web3.js')
const BN = require('bn.js')

const { preciseNumberPartsToNumber } = require('./math')

const MAX_PRICE_NODES = 1000
const MAX_OFFERS = 2500
const MAX_USER_ESCROWS = 1500

function readPreciseNumberAsNumber(data, offsetRef) {
  const parts = []
  for (let i = 0; i < 4; i += 1) {
    parts.push(new BN(data.subarray(offsetRef.offset + i * 8, offsetRef.offset + (i + 1) * 8), undefined, 'le'))
  }
  offsetRef.offset += 32
  return preciseNumberPartsToNumber([parts])
}

function deserializeOrderbook(data) {
  const offsetRef = { offset: 8 }
  const readPubkey = () => {
    const pk = new PublicKey(data.subarray(offsetRef.offset, offsetRef.offset + 32))
    offsetRef.offset += 32
    return pk
  }

  const thresholdAmount = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const lnMakerFeeRate = data.readDoubleLE(offsetRef.offset)
  offsetRef.offset += 8
  const lnTakerFeeRate = data.readDoubleLE(offsetRef.offset)
  offsetRef.offset += 8
  const priceDecimals = data.readUInt8(offsetRef.offset)
  offsetRef.offset += 1
  offsetRef.offset += 1135

  const vault = readPubkey()
  const yieldPosition = readPubkey()
  const addressLookupTable = readPubkey()
  const exponentCoreProgram = readPubkey()
  const syProgram = readPubkey()
  const tokenEscrowSy = readPubkey()
  const tokenEscrowYt = readPubkey()
  const tokenEscrowPt = readPubkey()
  const cpiAccountOrderbook = readPubkey()
  const admin = readPubkey()

  offsetRef.offset += 32
  offsetRef.offset += 32
  const ytBalance = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const syBalance = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const ptBalance = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const ytFeeBalance = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const syFeeBalance = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const ptFeeBalance = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const stagedSy = data.readBigUInt64LE(offsetRef.offset)
  offsetRef.offset += 8
  const expirationTs = data.readUInt32LE(offsetRef.offset)
  offsetRef.offset += 4
  offsetRef.offset += 4

  offsetRef.offset += 4
  offsetRef.offset += 12
  const priceTreeSize = Number(data.readBigUInt64LE(offsetRef.offset))
  offsetRef.offset += 8
  offsetRef.offset += 4
  offsetRef.offset += 4

  const prices = []
  for (let i = 0; i < MAX_PRICE_NODES; i += 1) {
    const left = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const right = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const parent = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    offsetRef.offset += 4
    const key = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const firstOfferSellYt = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const firstOfferBuyYt = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const lastOfferSellYt = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const lastOfferBuyYt = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    if (key !== 0) prices.push({ key, firstOfferSellYt, firstOfferBuyYt, lastOfferSellYt, lastOfferBuyYt, parent, left, right })
  }

  const offersSize = Number(data.readBigUInt64LE(offsetRef.offset))
  offsetRef.offset += 8
  const offersBumpIndex = data.readUInt32LE(offsetRef.offset)
  offsetRef.offset += 4
  const offersFreeListHead = data.readUInt32LE(offsetRef.offset)
  offsetRef.offset += 4

  const offers = []
  for (let i = 0; i < MAX_OFFERS; i += 1) {
    offsetRef.offset += 4
    const nextOfferPointer = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const userVaultPointer = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const pricePointer = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const amount = data.readBigUInt64LE(offsetRef.offset)
    offsetRef.offset += 8
    const expiryAt = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const createdAt = data.readUInt32LE(offsetRef.offset)
    offsetRef.offset += 4
    const virtualOffer = data.readUInt8(offsetRef.offset) !== 0
    offsetRef.offset += 1
    const orderTypeFlag = data.readUInt8(offsetRef.offset)
    offsetRef.offset += 1
    const fillOrKill = data.readUInt8(offsetRef.offset) !== 0
    offsetRef.offset += 1
    offsetRef.offset += 5
    if (userVaultPointer !== 0) {
      offers.push({
        offerIndex: i + 1,
        nextOfferPointer,
        amount,
        userVaultPointer,
        expiryAt,
        createdAt,
        virtualOffer,
        orderTypeFlag,
        fillOrKill,
        pricePointer,
      })
    }
  }

  offsetRef.offset += 8
  offsetRef.offset += 4
  offsetRef.offset += 4

  const userEscrows = []
  for (let i = 0; i < MAX_USER_ESCROWS; i += 1) {
    offsetRef.offset += 4
    offsetRef.offset += 4
    const user = readPubkey()
    const yieldIndex = readPreciseNumberAsNumber(data, offsetRef)
    const ptAmount = data.readBigUInt64LE(offsetRef.offset)
    offsetRef.offset += 8
    const syAmount = data.readBigUInt64LE(offsetRef.offset)
    offsetRef.offset += 8
    const ytAmount = data.readBigUInt64LE(offsetRef.offset)
    offsetRef.offset += 8
    const stakedYtAmount = data.readBigUInt64LE(offsetRef.offset)
    offsetRef.offset += 8
    const staged = data.readBigUInt64LE(offsetRef.offset)
    offsetRef.offset += 8
    offsetRef.offset += 8
    userEscrows.push({ user, yieldIndex, ptAmount, syAmount, ytAmount, stakedYtAmount, staged })
  }

  return {
    vault,
    yieldPosition,
    addressLookupTable,
    exponentCoreProgram,
    syProgram,
    admin,
    tokenEscrowSy,
    tokenEscrowYt,
    tokenEscrowPt,
    cpiAccountOrderbook,
    financials: {
      expirationTs,
      syBalance,
      ytBalance,
      ptBalance,
      ytFeeBalance,
      syFeeBalance,
      ptFeeBalance,
      stagedSy,
    },
    prices,
    configurationOptions: {
      priceDecimals,
      thresholdAmount,
      lnMakerFeeRate,
      lnTakerFeeRate,
    },
    offers,
    userEscrows,
    offersSize,
    offersFreeListHead,
    offersBumpIndex,
    priceTreeSize,
  }
}

async function fetchOrderbook(accountSource, address) {
  const info = await accountSource.getAccountInfo(address)
  if (!info?.data) throw new Error(`Orderbook not found: ${address.toBase58()}`)
  return deserializeOrderbook(Buffer.from(info.data))
}

module.exports = {
  fetchOrderbook,
}
