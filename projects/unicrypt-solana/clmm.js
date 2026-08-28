const { getMultipleAccounts, decodeAccount } = require('../helper/solana')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const {
  bnToNumber,
  getLockerTokenLocks,
} = require('./utils')

const PROGRAM_LOCKER_CLMM = 'UNCXrB8cZXnmtYM1aSo1Wx3pQaeSZYuF2jCTesXvECs'

async function addClmmLocks(api) {
  const locks = await getLockerTokenLocks(PROGRAM_LOCKER_CLMM, api, 'unicryptTokenLockClmm')
  if (!locks.length) return

  const positionIds = []
  const poolIds = []
  locks.forEach(({ account }) => {
    positionIds.push(account.personalPositionNftId.toBase58())
    poolIds.push(account.ammId.toBase58())
  })

  const uniquePositionIds = getUniqueAddresses(positionIds, 'solana')
  const uniquePoolIds = getUniqueAddresses(poolIds, 'solana')

  const [positionAccounts, poolAccounts] = await Promise.all([
    getMultipleAccounts([...uniquePositionIds]),
    getMultipleAccounts([...uniquePoolIds]),
  ])

  const pools = new Map()
  uniquePoolIds.forEach((poolId, i) => {
    const info = poolAccounts[i]
    if (!info) return
    pools.set(poolId, decodeAccount('raydiumCLMM', info))
  })

  uniquePositionIds.forEach((positionId, i) => {
    const positionAccount = positionAccounts[i]
    if (!positionAccount) return
    const position = decodeAccount('raydiumPositionInfo', positionAccount)
    const pool = pools.get(position.poolId.toBase58())
    if (!pool) return

    addUniV3LikePosition({
      api,
      token0: pool.mintA.toBase58(),
      token1: pool.mintB.toBase58(),
      liquidity: bnToNumber(position.liquidity),
      tickLower: bnToNumber(position.tickLower),
      tickUpper: bnToNumber(position.tickUpper),
      tick: bnToNumber(pool.tickCurrent),
    })
  })
}

module.exports = {
  addClmmLocks,
}
