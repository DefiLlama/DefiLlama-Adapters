const { getMultipleAccounts, decodeAccount } = require('../helper/solana')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const {
  PROGRAM_LOCKER_CLMM,
  getField,
  toBase58,
  bnToNumber,
  getLockerTokenLocks,
  getUniqueAddresses,
} = require('./utils')

async function addClmmLocks(api) {
  const locks = await getLockerTokenLocks(PROGRAM_LOCKER_CLMM, 'unicryptTokenLockClmm', api)
  if (!locks.length) return

  const positionIds = []
  const poolIds = []
  locks.forEach(({ account }) => {
    const positionId = toBase58(getField(account, 'personalPositionNftId', 'personal_position_nft_id'))
    const poolId = toBase58(getField(account, 'ammId', 'amm_id'))
    if (positionId) positionIds.push(positionId)
    if (poolId) poolIds.push(poolId)
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
    pools.set(toBase58(poolId), decodeAccount('raydiumCLMM', info))
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
