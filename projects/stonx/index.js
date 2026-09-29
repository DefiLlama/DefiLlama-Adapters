const { getLogs } = require('../helper/cache/getLogs')

const CORE = '0x00000000000014aa86c5d3c41765bb24e11bd701'
const VE33 = '0xD18685A514E59b06d59824e16Db07e73345d9953'
const VE33_POSITIONS = '0xda38ac72ce7220c4dd7719d114ef94edadb8f068'
const STONX = '0x570c5aa79c798e7a418412cc8399ae5bcce570c5'

// Ve33 was deployed at block 18,269,246. The first position managed by
// Ve33Positions was updated at block 23,649,680.
const DEPLOYMENT_BLOCK = 18269246
const FIRST_POSITION_BLOCK = 23649680

const POOL_INITIALIZED_EVENT =
  'event PoolInitialized(bytes32 poolId, (address token0, address token1, bytes32 config) poolKey, int32 tick, uint96 sqrtRatio)'
const POSITION_UPDATED_EVENT =
  'event PositionUpdated(address locker, bytes32 poolId, bytes32 positionId, int128 liquidityDelta, bytes32 balanceUpdate, bytes32 stateAfter)'
const STAKE_CHANGED_EVENT = 'event StakeChanged(address owner, bytes32 stakeId, int256 delta)'
const GET_POSITION_LIQUIDITY =
  'function getPositionLiquidity(uint256, (address,address,bytes32), int32, int32) view returns (uint128 liquidity, uint128 principal0, uint128 principal1)'

/** Extracts the extension address from a packed Ekubo PoolConfig. */
function getExtension(config) {
  return config.slice(0, 42).toLowerCase()
}

/** Decodes a Ve33Positions NFT id and signed tick bounds from a Core position id. */
function decodePositionId(positionId) {
  const value = BigInt(positionId)
  let tickLower = Number((value >> 32n) & 0xffffffffn)
  let tickUpper = Number(value & 0xffffffffn)

  if (tickLower >= 0x80000000) tickLower -= 0x100000000
  if (tickUpper >= 0x80000000) tickUpper -= 0x100000000

  return {
    id: (value >> 64n).toString(),
    tickLower,
    tickUpper,
  }
}

/** Returns the current token principal in every active STONX Ve33 LP position. */
async function tvl(api) {
  const poolLogs = await getLogs({
    api,
    target: CORE,
    eventAbi: POOL_INITIALIZED_EVENT,
    fromBlock: DEPLOYMENT_BLOCK,
    extraKey: 'stonx-pools',
  })

  const pools = new Map()
  for (const { args } of poolLogs) {
    const poolKey = args.poolKey
    if (getExtension(poolKey.config) !== VE33.toLowerCase()) continue

    pools.set(args.poolId.toLowerCase(), {
      token0: poolKey.token0,
      token1: poolKey.token1,
      config: poolKey.config,
    })
  }

  const positionLogs = await getLogs({
    api,
    target: CORE,
    eventAbi: POSITION_UPDATED_EVENT,
    fromBlock: FIRST_POSITION_BLOCK,
    extraKey: 'stonx-positions',
  })

  const positions = new Map()
  for (const { args } of positionLogs) {
    if (args.locker.toLowerCase() !== VE33_POSITIONS.toLowerCase()) continue

    const poolId = args.poolId.toLowerCase()
    if (!pools.has(poolId)) continue

    const key = `${poolId}-${args.positionId.toLowerCase()}`
    const position = positions.get(key) ?? {
      poolId,
      positionId: args.positionId,
      liquidity: 0n,
    }
    position.liquidity += BigInt(args.liquidityDelta)
    positions.set(key, position)
  }

  const activePositions = [...positions.values()].filter(({ liquidity }) => liquidity > 0n)
  const calls = activePositions.map(({ poolId, positionId }) => {
    const pool = pools.get(poolId)
    const { id, tickLower, tickUpper } = decodePositionId(positionId)
    return {
      params: [id, [pool.token0, pool.token1, pool.config], tickLower, tickUpper],
    }
  })

  const liquidities = await api.multiCall({
    target: VE33_POSITIONS,
    abi: GET_POSITION_LIQUIDITY,
    calls,
  })

  for (let i = 0; i < activePositions.length; i++) {
    const pool = pools.get(activePositions[i].poolId)
    const [, principal0, principal1] = liquidities[i]
    api.add(pool.token0, principal0)
    api.add(pool.token1, principal1)
  }
}

/** Returns the net STONX locked in Ve33 stakes. */
async function staking(api) {
  const stakeLogs = await getLogs({
    api,
    target: VE33,
    eventAbi: STAKE_CHANGED_EVENT,
    fromBlock: DEPLOYMENT_BLOCK,
    extraKey: 'stonx-stakes',
  })

  const staked = stakeLogs.reduce((total, { args }) => total + BigInt(args.delta), 0n)
  api.add(STONX, staked)
}

module.exports = {
  methodology:
    'TVL is the current token principal in every active STONX Ve33 liquidity position on Ekubo. Active positions are reconstructed from Ekubo Core events, then their token amounts are read from the canonical Ve33Positions manager. Core swap fees and claimable STONX rewards are excluded. Locked STONX is reported separately under staking based on net StakeChanged events.',
  doublecounted: true,
  robinhood: { tvl, staking },
}
