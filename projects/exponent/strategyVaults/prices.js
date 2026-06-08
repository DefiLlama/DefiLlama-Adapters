const { PublicKey } = require('@solana/web3.js')

const { EXPONENT_STRATEGY_VAULTS_PROGRAM_ID } = require('./constants')

const EXPONENT_PRICES_META_DISCRIMINATOR = Buffer.from([188, 97, 196, 52, 192, 41, 211, 196])
const MAX_PRICES = 1024
const MAX_PRICE_MANAGERS = 8
const MAX_AUTHORIZED_VAULT_CREATORS = 128
const PRICE_NODE_REGISTERS = 4
const PRICE_USAGE_AMOUNT_REGISTER = 1

const PUBKEY_BYTES = 32
const U32_BYTES = 4
const U64_BYTES = 8

const EXPONENT_PRICE_SIZE = 224
const PRICE_NODE_SIZE = EXPONENT_PRICE_SIZE
const NODE_REGISTERS_SIZE = PRICE_NODE_REGISTERS * U32_BYTES
const PRICE_NODE_WRAPPED_SIZE = NODE_REGISTERS_SIZE + PRICE_NODE_SIZE

const EXPONENT_PRICES_HEADER_SIZE =
  8 +
  4 +
  4 +
  MAX_PRICE_MANAGERS * PUBKEY_BYTES +
  8 +
  4 +
  4 +
  MAX_PRICES * PRICE_NODE_WRAPPED_SIZE +
  128
const EXPONENT_PRICES_AUTHORIZED_VAULT_CREATORS_OFFSET = EXPONENT_PRICES_HEADER_SIZE
const EXPONENT_PRICES_SIZE =
  EXPONENT_PRICES_AUTHORIZED_VAULT_CREATORS_OFFSET +
  U32_BYTES +
  U32_BYTES +
  MAX_AUTHORIZED_VAULT_CREATORS * PUBKEY_BYTES
const EXPONENT_PRICES_MIN_SIZE = EXPONENT_PRICES_HEADER_SIZE

function deriveExponentPricesAddress() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('exponent_prices')],
    EXPONENT_STRATEGY_VAULTS_PROGRAM_ID
  )[0]
}

async function fetchExponentPrices(connection) {
  const address = deriveExponentPricesAddress()
  const accountInfo = await connection.getAccountInfo(address)

  if (!accountInfo) throw new Error(`ExponentPrices account not found: ${address.toBase58()}`)
  if (!accountInfo.owner.equals(EXPONENT_STRATEGY_VAULTS_PROGRAM_ID)) {
    throw new Error(`ExponentPrices owner mismatch: ${accountInfo.owner.toBase58()}`)
  }

  const data = accountInfo.data
  if (data.length < EXPONENT_PRICES_MIN_SIZE) {
    throw new Error(`ExponentPrices account too small: ${data.length}`)
  }
  if (!data.subarray(0, 8).equals(EXPONENT_PRICES_META_DISCRIMINATOR)) {
    throw new Error('Invalid ExponentPrices discriminator')
  }

  let offset = 8
  const readU32 = () => {
    const value = data.readUInt32LE(offset)
    offset += U32_BYTES
    return value
  }
  const readU64 = () => {
    const value = data.readBigUInt64LE(offset)
    offset += U64_BYTES
    return value
  }

  const managersLen = readU32()
  offset += U32_BYTES
  if (managersLen > MAX_PRICE_MANAGERS) throw new Error(`Invalid ExponentPrices managers length: ${managersLen}`)

  const managers = []
  for (let i = 0; i < managersLen; i += 1) {
    const managerOffset = offset + i * PUBKEY_BYTES
    managers.push(new PublicKey(data.subarray(managerOffset, managerOffset + PUBKEY_BYTES)))
  }
  offset += MAX_PRICE_MANAGERS * PUBKEY_BYTES

  const allocatorSize = Number(readU64())
  const bumpIndex = readU32()
  const freeListHead = readU32()
  if (allocatorSize > MAX_PRICES) throw new Error(`Invalid ExponentPrices allocator size: ${allocatorSize}`)
  if (bumpIndex > MAX_PRICES + 1) throw new Error(`Invalid ExponentPrices bump index: ${bumpIndex}`)
  if (freeListHead > MAX_PRICES + 1) throw new Error(`Invalid ExponentPrices free list head: ${freeListHead}`)

  const nodesOffset = offset
  const readNodeAt = (index) => {
    if (index < 1 || index > MAX_PRICES) throw new Error(`Invalid ExponentPrices node index: ${index}`)
    const nodeOffset = nodesOffset + (index - 1) * PRICE_NODE_WRAPPED_SIZE
    const usageAmount = data.readUInt32LE(nodeOffset + PRICE_USAGE_AMOUNT_REGISTER * U32_BYTES)
    const valueOffset = nodeOffset + NODE_REGISTERS_SIZE

    const priceMintBytes = data.subarray(valueOffset, valueOffset + PUBKEY_BYTES)
    const active = priceMintBytes.some((b) => b !== 0)
    const priceMint = new PublicKey(priceMintBytes)
    const underlyingMint = new PublicKey(data.subarray(valueOffset + PUBKEY_BYTES, valueOffset + PUBKEY_BYTES * 2))

    const priceOffset = valueOffset + PUBKEY_BYTES * 2
    const n0 = data.readBigUInt64LE(priceOffset)
    const n1 = data.readBigUInt64LE(priceOffset + 8)
    const n2 = data.readBigUInt64LE(priceOffset + 16)
    const n3 = data.readBigUInt64LE(priceOffset + 24)

    const positionsAmount = data.readBigUInt64LE(valueOffset + 96)
    const lastUpdatedAt = data.readBigUInt64LE(valueOffset + 104)
    const lastUpdatedSlot = data.readBigUInt64LE(valueOffset + 112)
    const priceType = data.readUInt8(valueOffset + 120)
    const impliedApyBps = priceType === 3 || priceType === 16 || priceType === 17 ? data.readUInt32LE(valueOffset + 121) : null
    const priceInterfaceAccounts = new PublicKey(data.subarray(valueOffset + 128, valueOffset + 128 + PUBKEY_BYTES))

    return {
      active,
      usageAmount,
      price: {
        priceId: BigInt(index),
        priceMint,
        underlyingMint,
        price: [[n0, n1, n2, n3]],
        positionsAmount,
        lastUpdatedAt,
        lastUpdatedSlot,
        priceType,
        impliedApyBps,
        impliedApy: impliedApyBps === null ? null : impliedApyBps / 1_000_000,
        priceInterfaceAccounts,
        interfaceAccounts: [],
      },
    }
  }

  const prices = Array.from({ length: MAX_PRICES + 1 }, () => null)
  let activePrices = 0
  for (let nodeIndex = 1; nodeIndex <= MAX_PRICES; nodeIndex += 1) {
    const parsed = readNodeAt(nodeIndex)
    if (parsed.active) {
      prices[nodeIndex] = parsed.price
      activePrices += 1
    }
  }

  const authorizedVaultCreators = []
  if (data.length >= EXPONENT_PRICES_SIZE) {
    const authorizedVaultCreatorsLen = data.readUInt32LE(EXPONENT_PRICES_AUTHORIZED_VAULT_CREATORS_OFFSET)
    if (authorizedVaultCreatorsLen > MAX_AUTHORIZED_VAULT_CREATORS) {
      throw new Error(`Invalid authorized vault creators length: ${authorizedVaultCreatorsLen}`)
    }
    const authorizedVaultCreatorsOffset = EXPONENT_PRICES_AUTHORIZED_VAULT_CREATORS_OFFSET + U32_BYTES + U32_BYTES
    for (let i = 0; i < authorizedVaultCreatorsLen; i += 1) {
      const creatorOffset = authorizedVaultCreatorsOffset + i * PUBKEY_BYTES
      authorizedVaultCreators.push(new PublicKey(data.subarray(creatorOffset, creatorOffset + PUBKEY_BYTES)))
    }
  }

  if (activePrices !== allocatorSize) {
    throw new Error(`Corrupted ExponentPrices allocator: parsed ${activePrices}, allocator has ${allocatorSize}`)
  }

  return { managers, authorizedVaultCreators, prices }
}

module.exports = {
  deriveExponentPricesAddress,
  fetchExponentPrices,
}
