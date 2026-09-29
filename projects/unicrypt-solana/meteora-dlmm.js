const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, getMultipleAccounts, decodeAccount } = require('../helper/solana')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const {
  bnToNumber,
  toBigInt,
} = require('./utils')
const {
  BIN_ARRAY_DISCRIMINATOR,
  POSITION_V2_DISCRIMINATOR,
} = require('../helper/utils/solana/layouts/meteora-dlmm-layout')
const { METEORA_TOKEN_LOCK_TAG, parseMeteoraTokenLock } = require('../helper/utils/solana/layouts/unicrypt-layout')

const PROGRAM_METEORA_LOCKER = 'uNCXmCod5WAkjfkNJPMZ9WRKDNiwQnM778RVbP17a6U'
const PROGRAM_DLMM = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'
const BIN_ARRAY_LB_PAIR_OFFSET = 24
const BIN_ARRAY_FETCH_CONCURRENCY = 5

async function getDlmmBinsByPair(pairIds, api) {
  const connection = getConnection()
  const out = new Map()

  for (let i = 0; i < pairIds.length; i += BIN_ARRAY_FETCH_CONCURRENCY) {
    const chunk = pairIds.slice(i, i + BIN_ARRAY_FETCH_CONCURRENCY)
    await Promise.all(chunk.map(async (pairId) => {
      const raw = await connection.getProgramAccounts(new PublicKey(PROGRAM_DLMM), {
        filters: [
          { memcmp: { offset: 0, bytes: bs58.encode(BIN_ARRAY_DISCRIMINATOR) } },
          { memcmp: { offset: BIN_ARRAY_LB_PAIR_OFFSET, bytes: pairId } },
        ],
      })
      const binsById = new Map()
      for (const { account } of raw) {
        const binArray = decodeAccount('meteoraBinArray', account)
        const base = bnToNumber(binArray.index) * 70
        const bins = binArray.bins || []
        bins.forEach((bin, idx) => binsById.set(base + idx, bin))
      }
      out.set(pairId, binsById)
    }))
  }

  return out
}

async function addMeteoraLocks(api) {
  const connection = getConnection()
  const lockerAccounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_METEORA_LOCKER), {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(Buffer.from([METEORA_TOKEN_LOCK_TAG])) } }],
  })
  const locks = lockerAccounts.map(({ account }) => parseMeteoraTokenLock(account))
  if (!locks.length) return

  const positionIds = getUniqueAddresses(locks.map(i => i.positionKey), 'solana')
  const lbPairIds = getUniqueAddresses(locks.map(i => i.lbPair), 'solana')

  const [positionsRaw, lbPairsRaw, binsByPair] = await Promise.all([
    getMultipleAccounts([...positionIds]),
    getMultipleAccounts([...lbPairIds]),
    getDlmmBinsByPair(lbPairIds, api),
  ])

  const positions = new Map()
  positionIds.forEach((id, i) => {
    const raw = positionsRaw[i]
    if (!raw) return
    const disc = raw.data.subarray(0, 8)
    if (!disc.equals(POSITION_V2_DISCRIMINATOR)) return
    positions.set(id, decodeAccount('meteoraPosition', raw))
  })

  const lbPairs = new Map()
  lbPairIds.forEach((id, i) => {
    const raw = lbPairsRaw[i]
    if (!raw) return
    lbPairs.set(id, decodeAccount('meteoraLbPair', raw))
  })

  let skipped = 0
  for (const lock of locks) {
    const position = positions.get(lock.positionKey)
    const lbPair = lbPairs.get(lock.lbPair)
    if (!position || !lbPair) { skipped++; continue }

    const lower = bnToNumber(position.lowerBinId)
    const upper = bnToNumber(position.upperBinId)
    const shares = position.liquidityShares || []

    let amountX = 0n
    let amountY = 0n

    const binsById = binsByPair.get(lock.lbPair) || new Map()
    for (let i = lower; i <= upper; i++) {
      const idx = i - lower
      if (idx < 0 || idx >= shares.length) continue
      const share = toBigInt(shares[idx])
      if (share === 0n) continue

      const bin = binsById.get(i)
      if (!bin) continue

      const liqSupply = toBigInt(bin.liquiditySupply)
      if (liqSupply === 0n) continue

      const binX = toBigInt(bin.amountX)
      const binY = toBigInt(bin.amountY)

      amountX += (share * binX) / liqSupply
      amountY += (share * binY) / liqSupply
    }
    if (amountX > 0n) api.add(lbPair.tokenXMint.toBase58(), amountX.toString())
    if (amountY > 0n) api.add(lbPair.tokenYMint.toBase58(), amountY.toString())
  }

  if (skipped) api.log(`[unicrypt-solana] skipped ${skipped} Meteora locker accounts: closed/non-V2 position or missing pair`)
}

module.exports = {
  addMeteoraLocks,
}
