const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, getMultipleAccounts, decodeAccount } = require('../helper/solana')
const {
  PROGRAM_METEORA_LOCKER,
  PROGRAM_DLMM,
  BIN_ARRAY_LB_PAIR_OFFSET,
  bnToNumber,
  toBigInt,
  mulDiv,
  recordDecodeFailure,
  logDecodeFailures,
  getUniqueAddresses,
} = require('./utils')
const {
  BIN_ARRAY_DISCRIMINATOR,
  POSITION_V2_DISCRIMINATOR,
} = require('../helper/utils/solana/layouts/meteora-dlmm-layout')
const { METEORA_TOKEN_LOCK_TAG, parseMeteoraTokenLock } = require('../helper/utils/solana/layouts/unicrypt-layout')

const BIN_ARRAY_FETCH_CONCURRENCY = 5

function parseBinArrayState(binArray) {
  const bins = binArray.bins || []
  const byBinId = new Map()
  const base = bnToNumber(binArray.index) * 70
  bins.forEach((bin, i) => {
    byBinId.set(base + i, bin)
  })
  return byBinId
}

async function getDlmmBinArraysByPair(pairIds, api) {
  const connection = getConnection()
  const out = new Map()
  const decodeFailures = { count: 0 }

  for (let i = 0; i < pairIds.length; i += BIN_ARRAY_FETCH_CONCURRENCY) {
    const chunk = pairIds.slice(i, i + BIN_ARRAY_FETCH_CONCURRENCY)
    await Promise.all(chunk.map(async (pairId) => {
      const raw = await connection.getProgramAccounts(new PublicKey(PROGRAM_DLMM), {
        filters: [
          { memcmp: { offset: 0, bytes: bs58.encode(BIN_ARRAY_DISCRIMINATOR) } },
          { memcmp: { offset: BIN_ARRAY_LB_PAIR_OFFSET, bytes: pairId } },
        ],
      })
      const parsed = []
      for (const { account } of raw) {
        try {
          parsed.push(decodeAccount('meteoraBinArray', account))
        } catch (e) {
          recordDecodeFailure(decodeFailures, e)
        }
      }
      out.set(pairId, parsed)
    }))
  }

  logDecodeFailures(api, 'Meteora DLMM bin-array accounts', decodeFailures)
  return out
}

function buildBinsByPair(binArraysByPair) {
  const binsByPair = new Map()
  binArraysByPair.forEach((arrays, pairId) => {
    const binsById = new Map()
    arrays.forEach((arr) => {
      const map = parseBinArrayState(arr)
      map.forEach((bin, binId) => binsById.set(binId, bin))
    })
    binsByPair.set(pairId, binsById)
  })
  return binsByPair
}

async function addMeteoraLocks(api) {
  const connection = getConnection()
  const lockerAccounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_METEORA_LOCKER), {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(Buffer.from([METEORA_TOKEN_LOCK_TAG])) } }],
  })
  const locks = []
  const lockDecodeFailures = { count: 0 }
  lockerAccounts.forEach(({ account }) => {
    try {
      locks.push(parseMeteoraTokenLock(account))
    } catch (e) {
      recordDecodeFailure(lockDecodeFailures, e)
    }
  })
  logDecodeFailures(api, 'Meteora locker accounts', lockDecodeFailures)
  if (!locks.length) return

  const positionIds = getUniqueAddresses(locks.map(i => i.positionKey), 'solana')
  const lbPairIds = getUniqueAddresses(locks.map(i => i.lbPair), 'solana')

  const [positionsRaw, lbPairsRaw, binArraysByPair] = await Promise.all([
    getMultipleAccounts([...positionIds]),
    getMultipleAccounts([...lbPairIds]),
    getDlmmBinArraysByPair(lbPairIds, api),
  ])
  const binsByPair = buildBinsByPair(binArraysByPair)

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

  for (const lock of locks) {
    const position = positions.get(lock.positionKey)
    const lbPair = lbPairs.get(lock.lbPair)
    if (!position || !lbPair) continue

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

      amountX += mulDiv(share, binX, liqSupply)
      amountY += mulDiv(share, binY, liqSupply)
    }
    if (amountX > 0n) api.add(lbPair.tokenXMint.toBase58(), amountX.toString())
    if (amountY > 0n) api.add(lbPair.tokenYMint.toBase58(), amountY.toString())
  }
}

module.exports = {
  addMeteoraLocks,
}
