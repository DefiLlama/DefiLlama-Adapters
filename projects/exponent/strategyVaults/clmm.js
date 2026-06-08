const { PublicKey } = require('@solana/web3.js')
const BN = require('bn.js')

const {
  bnToBigInt,
  preciseNumberPartsToNumber,
  preciseNumberPartsToRaw,
} = require('./math')

const PRECISE_NUMBER_DENOM = 1_000_000_000_000n
const SENTINEL_TICK_INDEX = 0xffffffff

function invariantError(message) {
  return new Error(`WithdrawLiquidityInvariantViolated: ${message}`)
}

function isLiveTick(tick) {
  if (!tick) return false
  if (tick.isInitialized != null) return tick.isInitialized
  return tick.apyBasePoints > 0 ||
    tick.impliedRate > 0 ||
    tick.liquidityGross !== 0n ||
    tick.principalShareSupply !== 0n ||
    tick.principalPt !== 0n ||
    tick.principalSy !== 0n ||
    tick.frozenLiquidity !== 0n
}

function getTickByIndex(ticks, tickIdx) {
  const tick = ticks.ticksTree[tickIdx - 1]
  if (!isLiveTick(tick)) throw invariantError(`missing tick at index ${tickIdx}`)
  return tick
}

function successorTickIdx(ticks, tickIdx) {
  const tick = ticks.ticksTree[tickIdx - 1]
  if (!isLiveTick(tick)) return null
  const node = tick.treeNode
  if (!node) return null

  let right = node.right
  if (right !== 0) {
    while (ticks.ticksTree[right - 1]?.treeNode?.left) right = ticks.ticksTree[right - 1].treeNode.left
    return isLiveTick(ticks.ticksTree[right - 1]) ? right : null
  }

  let cursor = tickIdx
  let parent = node.parent
  while (parent !== 0 && cursor === ticks.ticksTree[parent - 1]?.treeNode?.right) {
    cursor = parent
    parent = ticks.ticksTree[parent - 1]?.treeNode?.parent ?? 0
  }
  return parent !== 0 && isLiveTick(ticks.ticksTree[parent - 1]) ? parent : null
}

function splitSuccessorForEpoch(ticks, leftIdx, rightIdx, splitEpoch) {
  let cursor = successorTickIdx(ticks, leftIdx)
  while (cursor != null && cursor !== SENTINEL_TICK_INDEX && cursor !== rightIdx) {
    const tick = getTickByIndex(ticks, cursor)
    if (tick.splitParentIdx === leftIdx && tick.splitParentEpoch === splitEpoch) return cursor
    cursor = successorTickIdx(ticks, cursor)
  }
  return null
}

function fastMulRatioRaw(rawPreciseNumber, numerator, denominator) {
  if (denominator <= 0n) throw invariantError('fastMulRatio denominator is zero')
  if (numerator === 0n || rawPreciseNumber === 0n) return 0n
  if (numerator === denominator) return rawPreciseNumber
  const q = rawPreciseNumber / denominator
  const r = rawPreciseNumber % denominator
  return q * numerator + (r * numerator) / denominator
}

function numberFromRatioRaw(numerator, denominator) {
  if (denominator <= 0n) throw invariantError('Number::from_ratio denominator is zero')
  return (numerator * PRECISE_NUMBER_DENOM) / denominator
}

function mulNumberRaw(leftRaw, rightRaw) {
  return (leftRaw * rightRaw) / PRECISE_NUMBER_DENOM
}

function principalOutForBurn(principal, burnShares, shareSupply) {
  if (principal === 0n || burnShares === 0n || shareSupply === 0n) return 0n
  if (burnShares >= shareSupply) return principal
  const out = (principal * burnShares) / shareSupply
  return out < principal ? out : principal
}

function projectAnchorSharesToCurrentTicks(ticks, rootShares) {
  const stack = rootShares.map((share) => ({
    tickIdx: share.tickIdx,
    rightTickIdx: share.rightTickIdx,
    splitEpoch: share.splitEpoch,
    lpShare: share.lpShare,
    emissions: share.emissions.map((e) => ({ staged: e.staged, lastSeenIndex: e.lastSeenIndex })),
  }))
  const newShares = []

  while (stack.length > 0) {
    const principalShare = stack.pop()
    const tickNode = getTickByIndex(ticks, principalShare.tickIdx)
    const lastSplitEpoch = tickNode.lastSplitEpoch

    if (principalShare.splitEpoch < lastSplitEpoch) {
      const rightIndex = principalShare.rightTickIdx
      if (rightIndex === SENTINEL_TICK_INDEX) throw invariantError('no right index for split range')

      const splitIndex = splitSuccessorForEpoch(ticks, principalShare.tickIdx, rightIndex, principalShare.splitEpoch)
      if (splitIndex == null) throw invariantError('no split successor for parent epoch')

      const rightTickNode = getTickByIndex(ticks, rightIndex)
      const splitTickNode = getTickByIndex(ticks, splitIndex)
      const splitFullRange = rightTickNode.impliedRate - tickNode.impliedRate
      const currentSplitRange = splitTickNode.impliedRate - tickNode.impliedRate

      const [leftShare, migratedShare] = splitFullRange <= 0
        ? [0n, principalShare.lpShare]
        : (() => {
          const ratio = Math.max(0, Math.min(1, currentSplitRange / splitFullRange))
          const scaledNum = BigInt(Math.round(ratio * Number(PRECISE_NUMBER_DENOM)))
          return [
            fastMulRatioRaw(principalShare.lpShare, scaledNum, PRECISE_NUMBER_DENOM),
            fastMulRatioRaw(principalShare.lpShare, PRECISE_NUMBER_DENOM - scaledNum, PRECISE_NUMBER_DENOM),
          ]
        })()

      principalShare.lpShare = leftShare
      principalShare.rightTickIdx = splitIndex
      stack.push({
        tickIdx: splitIndex,
        rightTickIdx: rightIndex,
        splitEpoch: principalShare.splitEpoch,
        lpShare: migratedShare,
        emissions: principalShare.emissions.map((tracker) => ({
          staged: 0n,
          lastSeenIndex: tracker.lastSeenIndex,
        })),
      })
      principalShare.splitEpoch += 1n
      stack.push(principalShare)
      continue
    }

    newShares.push(principalShare)
  }

  newShares.reverse()
  return newShares
}

function updateLpPositionShares(marketEmissions, ticks, position) {
  const marketEmissionIndices = (marketEmissions.trackers || []).map((tracker) => tracker.lpShareIndex)
  const recomputedShares = projectAnchorSharesToCurrentTicks(ticks, position.shareTrackers)

  recomputedShares.forEach((share) => {
    const tickNode = getTickByIndex(ticks, share.tickIdx)
    for (let i = 0; i < marketEmissionIndices.length; i += 1) {
      if (tickNode.emissions[i]) tickNode.emissions[i].lastSeenIndex = marketEmissionIndices[i]
    }
    share.splitEpoch = tickNode.lastSplitEpoch
  })

  return { ...position, shareTrackers: recomputedShares }
}

function calculatePtSyRemoval(position, ticks, liquidityToRemove) {
  let totalPtOut = 0n
  let totalSyOut = 0n
  const isFullRemoval = liquidityToRemove === position.lpBalance
  if (liquidityToRemove <= 0n || liquidityToRemove > position.lpBalance) throw invariantError('invalid liquidity amount')

  position.shareTrackers.forEach((share) => {
    const burnShares = isFullRemoval
      ? share.lpShare
      : mulNumberRaw(share.lpShare, numberFromRatioRaw(liquidityToRemove, position.lpBalance))
    const tickNode = getTickByIndex(ticks, share.tickIdx)
    if (burnShares > tickNode.principalShareSupply) throw invariantError('withdraw burn shares exceed tick supply')
    totalPtOut += principalOutForBurn(tickNode.principalPt, burnShares, tickNode.principalShareSupply)
    totalSyOut += principalOutForBurn(tickNode.principalSy, burnShares, tickNode.principalShareSupply)
  })

  return { totalPtOut, totalSyOut }
}

function getPtAndSyOnWithdrawLiquidity(marketEmissions, ticks, position, liquidityToRemove) {
  return calculatePtSyRemoval(updateLpPositionShares(marketEmissions, ticks, position), ticks, liquidityToRemove)
}

function deserializeMarketThreeTicks(data) {
  const MAX_TICK_NODES = 1000
  const TRACKER_SIZE = 2
  const OLD_TICKS_ACCOUNT_SIZE = 344_136
  const NEW_TICKS_ACCOUNT_SIZE = 360_136
  const isNewLayout = data.length === NEW_TICKS_ACCOUNT_SIZE
  if (!isNewLayout && data.length !== OLD_TICKS_ACCOUNT_SIZE) {
    throw new Error(`Unexpected CLMM ticks account size: ${data.length}`)
  }

  let offset = 8
  const readU64 = () => {
    const value = data.readBigUInt64LE(offset)
    offset += 8
    return value
  }
  const readU128 = () => {
    const lo = data.readBigUInt64LE(offset)
    const hi = data.readBigUInt64LE(offset + 8)
    offset += 16
    return lo + (hi << 64n)
  }
  const readI128 = () => {
    const lo = data.readBigUInt64LE(offset)
    const hi = data.readBigInt64LE(offset + 8)
    offset += 16
    return lo + (hi << 64n)
  }
  const readF64 = () => {
    const value = data.readDoubleLE(offset)
    offset += 8
    return value
  }
  const readU32 = () => {
    const value = data.readUInt32LE(offset)
    offset += 4
    return value
  }
  const readPubkey = () => {
    const value = new PublicKey(data.subarray(offset, offset + 32))
    offset += 32
    return value
  }
  const readPreciseNumberAsNumber = () => {
    const parts = []
    for (let i = 0; i < 4; i += 1) {
      parts.push(new BN(data.subarray(offset + i * 8, offset + (i + 1) * 8), undefined, 'le'))
    }
    offset += 32
    return preciseNumberPartsToNumber([parts])
  }
  const readPreciseNumberAsBigint = () => {
    let value = 0n
    for (let i = 0; i < 4; i += 1) value += data.readBigUInt64LE(offset + i * 8) << BigInt(i * 64)
    offset += 32
    return value
  }

  const tickTreeRoot = readU32()
  offset += 12
  const tickTreeSize = readU64()
  const tickTreeBumpIndex = readU32()
  const tickTreeFreeListHead = readU32()
  const ticks = []

  for (let i = 0; i < MAX_TICK_NODES; i += 1) {
    const treeNode = {
      left: readU32(),
      right: readU32(),
      parent: readU32(),
      colorOrFree: readU32(),
    }
    const apyBasePoints = readU32()
    offset += 4
    const feeGrowthOutsidePt = readU128()
    const feeGrowthOutsideSy = readU128()
    const liquidityNet = readI128()
    const liquidityGross = readU64()
    const impliedRate = readF64()
    const principalPt = readU64()
    const principalSy = readU64()
    const principalShareSupply = readPreciseNumberAsBigint()
    const farms = []
    for (let j = 0; j < TRACKER_SIZE; j += 1) farms.push({ lastSeenIndex: readPreciseNumberAsNumber() })
    const emissions = []
    for (let j = 0; j < TRACKER_SIZE; j += 1) {
      emissions.push({ lastSeenIndex: readPreciseNumberAsNumber(), lastPositionIndex: readPreciseNumberAsNumber() })
    }
    const lastSplitEpoch = readU64()
    const splitParentEpoch = isNewLayout ? readU64() : 0n
    const frozenLiquidity = readU64()
    const splitParentIdx = isNewLayout ? readU32() : SENTINEL_TICK_INDEX
    if (isNewLayout) offset += 4
    ticks.push({
      apyBasePoints,
      liquidityNet,
      feeGrowthOutsidePt,
      feeGrowthOutsideSy,
      liquidityGross,
      impliedRate,
      principalPt,
      principalSy,
      principalShareSupply,
      farms,
      emissions,
      lastSplitEpoch,
      splitParentEpoch,
      frozenLiquidity,
      splitParentIdx,
      treeNode,
      isInitialized: false,
    })
  }

  const initializedTickIndices = new Set()
  const stack = tickTreeRoot === 0 ? [] : [tickTreeRoot]
  while (stack.length > 0) {
    const tickIdx = stack.pop()
    if (tickIdx < 1 || tickIdx > MAX_TICK_NODES || initializedTickIndices.has(tickIdx)) continue
    initializedTickIndices.add(tickIdx)
    const node = ticks[tickIdx - 1]?.treeNode
    if (node?.left) stack.push(node.left)
    if (node?.right) stack.push(node.right)
  }
  ticks.forEach((tick, index) => {
    tick.isInitialized = initializedTickIndices.has(index + 1)
  })

  const market = readPubkey()
  const feeGrowthIndexGlobalPt = readU128()
  const feeGrowthIndexGlobalSy = readU128()
  const currentPrefixSum = readU64()
  const currentSpotPrice = readF64()
  const currentTick = readU32()

  return {
    ticksTree: ticks,
    market,
    feeGrowthIndexGlobalPt,
    feeGrowthIndexGlobalSy,
    currentPrefixSum,
    currentSpotPrice,
    currentTick,
    tickTreeRoot,
    tickTreeSize,
    tickTreeBumpIndex,
    tickTreeFreeListHead,
  }
}

function mapLpPosition(raw) {
  return {
    owner: raw.owner,
    market: raw.market,
    feeInsideLastPt: bnToBigInt(raw.feeInsideLastPt),
    feeInsideLastSy: bnToBigInt(raw.feeInsideLastSy),
    lpBalance: bnToBigInt(raw.lpBalance),
    tokensOwedSy: bnToBigInt(raw.tokensOwedSy),
    tokensOwedPt: bnToBigInt(raw.tokensOwedPt),
    lowerTickIdx: raw.lowerTickIdx,
    upperTickIdx: raw.upperTickIdx,
    shareTrackers: raw.shareTrackers.trackers.map((tracker) => ({
      tickIdx: tracker.tickIdx,
      rightTickIdx: tracker.rightTickIdx,
      splitEpoch: bnToBigInt(tracker.splitEpoch),
      lpShare: preciseNumberPartsToRaw(tracker.lpShare),
      emissions: tracker.emissions.trackers.map((entry) => ({
        staged: bnToBigInt(entry.staged),
        lastSeenIndex: preciseNumberPartsToNumber(entry.lastSeenIndex),
      })),
    })),
  }
}

function mapMarket(raw) {
  return {
    ticks: raw.ticks,
    emissions: {
      trackers: (raw.emissions.trackers || []).map((entry) => ({
        tokenEscrow: entry.tokenEscrow,
        lpShareIndex: preciseNumberPartsToNumber(entry.lpShareIndex),
        lastSeenStaged: Number(entry.lastSeenStaged),
      })),
    },
  }
}

async function fetchClmmPositionContext(programs, entry) {
  const lpPositionRaw = await programs.cache.fetchAccount(programs.clmm, 'lpPosition', entry.lpPosition)
  const marketRaw = await programs.cache.fetchAccount(programs.clmm, 'marketThree', entry.market)
  const market = mapMarket(marketRaw)
  const ticksInfo = await programs.cache.getAccountInfo(market.ticks)
  if (!ticksInfo?.data) throw new Error(`CLMM ticks account not found: ${market.ticks.toBase58()}`)

  return {
    lpPosition: mapLpPosition(lpPositionRaw),
    market,
    ticks: deserializeMarketThreeTicks(Buffer.from(ticksInfo.data)),
  }
}

module.exports = {
  fetchClmmPositionContext,
  getPtAndSyOnWithdrawLiquidity,
}
