const { PublicKey } = require('@solana/web3.js')

const { fetchClmmPositionContext, getPtAndSyOnWithdrawLiquidity } = require('./clmm')
const {
  KAMINO_FARM_ACCOUNT_DISCRIMINATOR_LEN,
  KAMINO_FARM_GLOBAL_CONFIG_TREASURY_FEE_BPS_OFFSET,
  applyKaminoFarmTreasuryFee,
  calculateKaminoFarmPrincipalAmount,
  decodeKaminoFarmUserState,
  decodeKaminoFarmState,
  decodeKaminoScopeDatedPrice,
  decodeOptionalKaminoFarmUserState,
  getKaminoFarmScopePricesAddress,
  projectKaminoFarmGlobalRewards,
  projectKaminoFarmUserRewards,
} = require('./kaminoFarms')
const { getKaminoFarmsObligationFarm } = require('./constants')
const {
  BigNumber,
  bnToBigInt,
  decimalFloorToBigInt,
  deriveYtPriceInBase,
  fractionToDecimal,
  getPriceInputMint,
  parseTokenAccountAmount,
  preciseNumberPartsToNumber,
  resolvePrice,
  resolveTailPrice,
  toDecimal,
} = require('./math')
const { fetchOrderbook } = require('./orderbook')
const { mintPt, mintYt } = require('./pda')

const PositionType = {
  Reserves: 'reserves',
  TokenAccount: 'tokenAccount',
  Orderbook: 'orderbook',
  YieldPosition: 'yieldPosition',
  KaminoObligation: 'kaminoObligation',
  ClmmPosition: 'clmmPosition',
  LoopscaleLoan: 'loopscaleLoan',
  LoopscaleStrategy: 'loopscaleStrategy',
  KaminoFarm: 'kaminoFarm',
}

const DEFAULT_PUBLIC_KEY = PublicKey.default
const KAMINO_RESERVE_FARM_KIND_COLLATERAL = 0
const KAMINO_RESERVE_FARM_KIND_DEBT = 1
const LOOPSCALE_LOAN_DISCRIMINATOR = Buffer.from([20, 195, 70, 117, 165, 227, 182, 1])
const LOOPSCALE_DISCRIMINATOR_LEN = 8
const LOOPSCALE_LOAN_HEADER_LEN = 51
const LOOPSCALE_LEDGER_LEN = 182
const LOOPSCALE_COLLATERAL_LEN = 73
const LOOPSCALE_LEDGER_COUNT = 5
const LOOPSCALE_COLLATERAL_COUNT = 5
const LOOPSCALE_DECIMAL_SCALE = 1_000_000_000_000_000_000n

function tupleValue(value) {
  if (!value) return null
  if (Array.isArray(value)) return value[0]
  return value[0] || value['0'] || null
}

function numericBn(value) {
  if (value == null) return 0
  if (typeof value === 'number') return value
  return Number(value.toString())
}

function readBigUIntLE(buffer, offset, byteLength) {
  let result = 0n
  for (let i = 0; i < byteLength; i += 1) {
    result += BigInt(buffer[offset + i]) << BigInt(i * 8)
  }
  return result
}

async function getCurrentValuationClock(connection) {
  const currentSlot = BigInt(await connection.getSlot('confirmed'))
  const blockTime = await connection.getBlockTime(Number(currentSlot))
  return {
    currentSlot,
    currentUnixTimestamp: BigInt(blockTime || Math.floor(Date.now() / 1000)),
  }
}

function getTotalAum(vault) {
  return bnToBigInt(vault.financials.aumInBase) + bnToBigInt(vault.financials.aumInBaseInPositions)
}

function buildFetchedMintSimplePriceId(entry) {
  return {
    simple: {
      priceId: entry.priceId,
      underlyingMint: entry.underlyingMint,
    },
  }
}

function resolveMintPriceIdFromTrackedState(vault, mint) {
  const tokenEntry = (vault.tokenEntries || []).find((entry) => entry.mint.equals(mint))
  if (tokenEntry) return tokenEntry.priceId

  for (const position of vault.strategyPositions || []) {
    if (position.tokenAccount) {
      const entry = tupleValue(position.tokenAccount)
      if (entry?.tokenMint.equals(mint) && entry.balances.length > 0) return entry.balances[0].priceId
    }
  }
  return null
}

function resolveMintPriceId(vault, mint, prices) {
  const tracked = resolveMintPriceIdFromTrackedState(vault, mint)
  if (tracked) return tracked

  const priceEntry = prices?.prices.find((entry) => entry?.priceMint.equals(mint))
  return priceEntry ? buildFetchedMintSimplePriceId(priceEntry) : null
}

function projectYieldPositionClaimableInterestAfterFee(yieldPosition, coreVault, currentSyExchangeRate) {
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const maturityTimestamp = numericBn(coreVault.startTs) + numericBn(coreVault.duration)
  const finalSyExchangeRate = currentTimestamp < maturityTimestamp
    ? Number(currentSyExchangeRate.toString())
    : preciseNumberPartsToNumber(coreVault.finalSyExchangeRate)

  const projectedUnstagedInterest = scaleSyToCurrentRate(
    calcEarnedSy(
      bnToBigInt(yieldPosition.ytBalance),
      preciseNumberPartsToNumber(yieldPosition.interest.lastSeenIndex),
      finalSyExchangeRate
    ),
    finalSyExchangeRate,
    Number(currentSyExchangeRate.toString())
  )
  const grossClaimableInterest = bnToBigInt(yieldPosition.interest.staged) + projectedUnstagedInterest
  const treasuryAmount = (grossClaimableInterest * BigInt(coreVault.interestBpsFee) + 9_999n) / 10_000n
  return grossClaimableInterest - treasuryAmount
}

function calcEarnedSy(ytBalance, lastSeenRate, currentRate) {
  if (ytBalance === 0n || lastSeenRate >= currentRate || lastSeenRate === 0) return 0n
  const delta = new BigNumber(1).div(lastSeenRate).minus(new BigNumber(1).div(currentRate))
  return decimalFloorToBigInt(delta.times(ytBalance.toString()))
}

function scaleSyToCurrentRate(syAmount, finalRate, currentRate) {
  if (syAmount === 0n || currentRate <= finalRate) return syAmount
  return decimalFloorToBigInt(new BigNumber(syAmount.toString()).times(finalRate).div(currentRate))
}

async function calculateTokenAccountAum(programs, entry, prices) {
  if (!entry.balances.length) return []
  const accountInfos = await programs.cache.getMultipleAccountsInfo(entry.balances.map((balance) => balance.tokenAccount))
  let totalAum = 0n

  for (let i = 0; i < entry.balances.length; i += 1) {
    const info = accountInfos[i]
    if (!info?.data) continue
    try {
      const tokenAmount = parseTokenAccountAmount(info.data)
      const price = resolvePrice(entry.balances[i].priceId, prices)
      totalAum += decimalFloorToBigInt(price.times(tokenAmount.toString()))
    } catch {
      // Match SDK behavior: skip entries whose price or token account parse fails.
    }
  }

  return [{ positionType: PositionType.TokenAccount, mint: entry.tokenMint.toBase58(), aum: totalAum }]
}

async function calculateReserveTokensAum(programs, vault, prices) {
  const tokenEntries = vault.tokenEntries || []
  const accountInfos = await programs.cache.getMultipleAccountsInfo(tokenEntries.map((entry) => entry.tokenSquadsAccount))
  const results = []

  for (let i = 0; i < tokenEntries.length; i += 1) {
    const info = accountInfos[i]
    if (!info?.data) continue
    const balance = parseTokenAccountAmount(info.data)
    if (balance === 0n) continue
    try {
      const price = resolvePrice(tokenEntries[i].priceId, prices)
      results.push({
        positionType: PositionType.Reserves,
        mint: tokenEntries[i].mint.toBase58(),
        aum: decimalFloorToBigInt(price.times(balance.toString())),
      })
    } catch {
      // Match SDK behavior.
    }
  }

  return results
}

async function calculateYieldPositionAum(programs, entry, vault, prices) {
  const ytMint = mintYt(entry.vault).toBase58()
  try {
    const yieldPosition = await programs.cache.fetchAccount(programs.core, 'yieldTokenPosition', entry.yieldPosition)
    const coreVault = await programs.cache.fetchAccount(programs.core, 'vault', entry.vault)

    const ptPrice = resolvePrice(entry.priceIdPt, prices)
    const syPrice = resolvePrice(entry.priceIdSy, prices)
    const currentSyExchangeRate = resolveTailPrice(entry.priceIdSy, prices)
    const ytPrice = deriveYtPriceInBase(syPrice, currentSyExchangeRate, ptPrice)
    let valueInBase = new BigNumber(0)

    const ytBalance = bnToBigInt(yieldPosition.ytBalance)
    if (ytPrice.gt(0)) valueInBase = valueInBase.plus(ytPrice.times(ytBalance.toString()))
    if (ytBalance > 0n || bnToBigInt(yieldPosition.interest.staged) > 0n) {
      const interest = projectYieldPositionClaimableInterestAfterFee(yieldPosition, coreVault, currentSyExchangeRate)
      valueInBase = valueInBase.plus(syPrice.times(interest.toString()))
    }

    return { positionType: PositionType.YieldPosition, mint: ytMint, aum: decimalFloorToBigInt(valueInBase) }
  } catch (error) {
    console.warn('Failed to calculate yield position AUM:', error)
    return { positionType: PositionType.YieldPosition, mint: ytMint, aum: 0n }
  }
}

function projectOrderbookStagedSy(userEscrow, currentSyRate) {
  if (userEscrow.staged < 0n) return 0n
  const lastSeenSyRate = userEscrow.yieldIndex
  if (lastSeenSyRate <= 0) return userEscrow.staged
  const currentSyRateNumber = Number(currentSyRate.toString())
  if (currentSyRateNumber <= lastSeenSyRate) return userEscrow.staged
  const rateDelta = 1 / lastSeenSyRate - 1 / currentSyRateNumber
  const interestEarned = Math.floor(rateDelta * Number(userEscrow.stakedYtAmount))
  return userEscrow.staged + BigInt(Math.max(interestEarned, 0))
}

function getOrderbookOfferValue(offer, syPrice, ptPrice, ytPrice) {
  const amount = new BigNumber(offer.amount.toString())
  return amount.times(offer.virtualOffer ? (offer.orderTypeFlag === 2 ? ptPrice : syPrice) : (offer.orderTypeFlag === 2 ? syPrice : ytPrice))
}

function addOrderbookEscrowValue(aumByMint, mint, amount, price) {
  if (amount <= 0n || price.lte(0)) return
  const value = price.times(amount.toString())
  aumByMint.set(mint, (aumByMint.get(mint) || new BigNumber(0)).plus(value))
}

async function calculateOrderbookAum(programs, entry, vault, prices) {
  try {
    const orderbook = await fetchOrderbook(programs.cache, entry.orderbook)
    const syExchangeRate = resolveTailPrice(entry.priceIdSy, prices)
    const syPrice = resolvePrice(entry.priceIdSy, prices)
    const ptPrice = resolvePrice(entry.priceIdPt, prices)
    const ytPrice = deriveYtPriceInBase(syPrice, syExchangeRate, ptPrice)
    const ptMint = mintPt(orderbook.vault).toBase58()
    const ytMint = mintYt(orderbook.vault).toBase58()

    const vaultEscrowIndices = new Set()
    orderbook.userEscrows.forEach((escrow, index) => {
      if (escrow.user.equals(vault.squadsVault)) vaultEscrowIndices.add(index + 1)
    })

    const aumByMint = new Map()
    entry.offerIdxVec.forEach((offerIdx) => {
      const offer = orderbook.offers.find((candidate) => candidate.offerIndex === offerIdx)
      if (!offer || !vaultEscrowIndices.has(offer.userVaultPointer)) return
      const mint = entry.mint.toBase58()
      aumByMint.set(mint, (aumByMint.get(mint) || new BigNumber(0)).plus(getOrderbookOfferValue(offer, syPrice, ptPrice, ytPrice)))
    })

    const userEscrow = orderbook.userEscrows.find((escrow) => escrow.user.equals(vault.squadsVault))
    if (userEscrow) {
      const stagedSy = projectOrderbookStagedSy(userEscrow, syExchangeRate)
      addOrderbookEscrowValue(aumByMint, entry.mint.toBase58(), userEscrow.syAmount + stagedSy, syPrice)
      addOrderbookEscrowValue(aumByMint, ptMint, userEscrow.ptAmount, ptPrice)
      addOrderbookEscrowValue(aumByMint, ytMint, userEscrow.ytAmount, ytPrice)
    }

    return Array.from(aumByMint.entries()).map(([mint, value]) => ({
      positionType: PositionType.Orderbook,
      mint,
      aum: decimalFloorToBigInt(value),
    }))
  } catch (error) {
    console.warn('Failed to calculate orderbook AUM:', error)
    return []
  }
}

function getReserveTotalSupply(reserve) {
  return toDecimal(reserve.liquidity.availableAmount)
    .plus(fractionToDecimal(reserve.liquidity.borrowedAmountSf))
    .minus(fractionToDecimal(reserve.liquidity.accumulatedProtocolFeesSf))
    .minus(fractionToDecimal(reserve.liquidity.accumulatedReferrerFeesSf))
    .minus(fractionToDecimal(reserve.liquidity.pendingReferrerFeesSf))
}

function getCollateralExchangeRate(reserve) {
  const totalSupply = getReserveTotalSupply(reserve)
  const mintTotalSupply = toDecimal(reserve.collateral.mintTotalSupply)
  if (mintTotalSupply.isZero() || totalSupply.isZero()) return new BigNumber(1)
  return totalSupply.div(mintTotalSupply)
}

function calculateReserveAmountInBase(reserve, rawAmount, isDeposit, mapping, prices, quotePrice, quoteInputMint) {
  const liquidityAmountRaw = isDeposit
    ? toDecimal(rawAmount).times(getCollateralExchangeRate(reserve))
    : fractionToDecimal(rawAmount)

  if (reserve.liquidity.mintPubkey.equals(quoteInputMint)) return liquidityAmountRaw.times(quotePrice)

  const reservePriceId = mapping.reservePriceId
  if (!reservePriceId || (reservePriceId.simple && bnToBigInt(reservePriceId.simple.priceId) === 0n)) {
    return liquidityAmountRaw.times(quotePrice)
  }

  return liquidityAmountRaw.times(resolvePrice(reservePriceId, prices)).times(quotePrice)
}

function calculateKaminoFarmRewardValueInBase({ farm, user, globalConfigData, scopePriceData, prices, valuationClock, vault }) {
  const treasuryFeeBps = globalConfigData.readBigUInt64LE(
    KAMINO_FARM_ACCOUNT_DISCRIMINATOR_LEN + KAMINO_FARM_GLOBAL_CONFIG_TREASURY_FEE_BPS_OFFSET,
  )
  const scopePrice = scopePriceData
    ? decodeKaminoScopeDatedPrice(scopePriceData, farm.scopeOraclePriceId)
    : null
  const projectedRewards = projectKaminoFarmUserRewards(
    farm,
    user,
    projectKaminoFarmGlobalRewards(farm, scopePrice, valuationClock),
  )

  let rewardValueInBase = new BigNumber(0)
  for (let rewardIndex = 0; rewardIndex < farm.numRewardTokens; rewardIndex += 1) {
    const projectedRewardAmount = projectedRewards.projectedRewardsIssuedUnclaimed[rewardIndex]
    if (projectedRewardAmount === 0n) continue

    const netRewardAmount = applyKaminoFarmTreasuryFee(projectedRewardAmount, treasuryFeeBps)
    if (netRewardAmount === 0n) continue

    const rewardMint = projectedRewards.projectedRewardInfos[rewardIndex].rewardMint
    const rewardPriceId = resolveMintPriceId(vault, rewardMint, prices)
    if (!rewardPriceId) continue

    rewardValueInBase = rewardValueInBase.plus(
      resolvePrice(rewardPriceId, prices).times(netRewardAmount.toString()),
    )
  }

  return rewardValueInBase
}

async function calculateDelegatedFarmRewardAumInBase(programs, entry, obligation, vault, prices, reserveMap, valuationClock) {
  if (!entry.reserveFarmMappings?.length) return new BigNumber(0)

  const accountKeys = new Map()
  for (const reserveFarmMapping of entry.reserveFarmMappings) {
    accountKeys.set(reserveFarmMapping.farmState.toBase58(), reserveFarmMapping.farmState)
    const userState = getKaminoFarmsObligationFarm(entry.obligation, reserveFarmMapping.farmState)
    accountKeys.set(userState.toBase58(), userState)
  }

  const uniqueAccountKeys = [...accountKeys.values()]
  const accountInfos = uniqueAccountKeys.length
    ? await programs.cache.getMultipleAccountsInfo(uniqueAccountKeys)
    : []
  const accountInfoMap = new Map()
  uniqueAccountKeys.forEach((key, index) => {
    accountInfoMap.set(key.toBase58(), accountInfos[index]?.data ? Buffer.from(accountInfos[index].data) : null)
  })

  let totalRewardValueInBase = new BigNumber(0)
  for (const reserveFarmMapping of entry.reserveFarmMappings) {
    let reserve = reserveMap.get(reserveFarmMapping.reserve.toBase58())
    if (!reserve) {
      reserve = await programs.cache.fetchAccount(programs.kamino, 'reserve', reserveFarmMapping.reserve).catch(() => null)
      if (reserve) reserveMap.set(reserveFarmMapping.reserve.toBase58(), reserve)
    }
    if (!reserve) throw new Error(`Missing tracked Kamino reserve ${reserveFarmMapping.reserve.toBase58()}`)

    const farmKind = numericBn(reserveFarmMapping.farmKind)
    const expectedFarmState = farmKind === KAMINO_RESERVE_FARM_KIND_COLLATERAL
      ? reserve.farmCollateral
      : farmKind === KAMINO_RESERVE_FARM_KIND_DEBT
        ? reserve.farmDebt
        : null
    if (!expectedFarmState?.equals(reserveFarmMapping.farmState)) {
      throw new Error(`Stored reserve farm mapping is stale for reserve ${reserveFarmMapping.reserve.toBase58()}`)
    }

    const farmData = accountInfoMap.get(reserveFarmMapping.farmState.toBase58())
    if (!farmData) throw new Error(`Missing delegated farm account ${reserveFarmMapping.farmState.toBase58()}`)
    const farm = decodeKaminoFarmState(farmData)
    if (!farm.isDelegated) throw new Error(`Stored farm ${reserveFarmMapping.farmState.toBase58()} is not delegated`)

    const userState = getKaminoFarmsObligationFarm(entry.obligation, reserveFarmMapping.farmState)
    const additionalAccounts = [farm.globalConfig]
    const scopePrices = getKaminoFarmScopePricesAddress(farm)
    if (scopePrices) additionalAccounts.push(scopePrices)

    const [globalConfigInfo, scopeInfo] = await programs.cache.getMultipleAccountsInfo(additionalAccounts)
    if (!globalConfigInfo?.data) throw new Error(`Missing delegated farm global config ${farm.globalConfig.toBase58()}`)

    const userData = accountInfoMap.get(userState.toBase58())
    if (!userData) continue
    const user = decodeOptionalKaminoFarmUserState(userData)
    if (!user) continue
    if (!user.delegatee.equals(entry.obligation)) throw new Error(`Delegated farm user ${userState.toBase58()} does not delegate to obligation`)
    if (!user.owner.equals(obligation.owner)) throw new Error(`Delegated farm user ${userState.toBase58()} owner mismatch`)
    if (scopePrices && !scopeInfo?.data) throw new Error(`Missing delegated farm scope prices ${scopePrices.toBase58()}`)

    totalRewardValueInBase = totalRewardValueInBase.plus(calculateKaminoFarmRewardValueInBase({
      farm,
      user,
      globalConfigData: Buffer.from(globalConfigInfo.data),
      scopePriceData: scopePrices ? Buffer.from(scopeInfo.data) : null,
      prices,
      valuationClock,
      vault,
    }))
  }

  return totalRewardValueInBase
}

async function calculateKaminoObligationAum(programs, entry, vault, prices, valuationClock) {
  try {
    const obligation = await programs.cache.fetchAccount(programs.kamino, 'obligation', entry.obligation)
    const defaultKey = DEFAULT_PUBLIC_KEY
    const deposits = obligation.deposits
      .filter((deposit) => !deposit.depositReserve.equals(defaultKey) && !deposit.depositedAmount.isZero())
      .map((deposit) => ({ reserve: deposit.depositReserve, rawAmount: deposit.depositedAmount, isDeposit: true }))
    const borrows = obligation.borrows
      .filter((borrow) => !borrow.borrowReserve.equals(defaultKey) && !borrow.borrowedAmountSf.isZero())
      .map((borrow) => ({ reserve: borrow.borrowReserve, rawAmount: borrow.borrowedAmountSf, isDeposit: false }))
    const reserveKeys = [...new Set([
      ...deposits,
      ...borrows,
      ...(entry.reservePriceMappings || []),
      ...(entry.reserveFarmMappings || []),
    ].map((value) => value.reserve.toBase58()))]
    const reserves = []
    for (const key of reserveKeys) {
      try {
        reserves.push(await programs.cache.fetchAccount(programs.kamino, 'reserve', new PublicKey(key)))
      } catch {
        reserves.push(null)
      }
    }
    const reserveMap = new Map()
    reserveKeys.forEach((key, index) => {
      if (reserves[index]) reserveMap.set(key, reserves[index])
    })

    const quotePrice = resolvePrice(entry.quotePriceId, prices)
    const quoteInputMint = getPriceInputMint(entry.quotePriceId, prices)
    let collateralBase = new BigNumber(0)
    let debtBase = new BigNumber(0)

    for (const value of deposits) {
      const mapping = entry.reservePriceMappings.find((candidate) => candidate.reserve.equals(value.reserve))
      const reserve = reserveMap.get(value.reserve.toBase58())
      if (!mapping || !reserve) continue
      collateralBase = collateralBase.plus(calculateReserveAmountInBase(reserve, value.rawAmount, true, mapping, prices, quotePrice, quoteInputMint))
    }

    for (const value of borrows) {
      const mapping = entry.reservePriceMappings.find((candidate) => candidate.reserve.equals(value.reserve))
      const reserve = reserveMap.get(value.reserve.toBase58())
      if (!mapping || !reserve) continue
      debtBase = debtBase.plus(calculateReserveAmountInBase(reserve, value.rawAmount, false, mapping, prices, quotePrice, quoteInputMint))
    }

    const delegatedRewardBase = await calculateDelegatedFarmRewardAumInBase(
      programs,
      entry,
      obligation,
      vault,
      prices,
      reserveMap,
      valuationClock,
    )
    const aum = BigNumber.max(collateralBase.minus(debtBase).plus(delegatedRewardBase), 0)
    return { positionType: PositionType.KaminoObligation, mint: vault.underlyingMint.toBase58(), aum: decimalFloorToBigInt(aum) }
  } catch (error) {
    console.warn('Failed to calculate Kamino obligation AUM:', error)
    return { positionType: PositionType.KaminoObligation, mint: vault.underlyingMint.toBase58(), aum: 0n }
  }
}

async function calculateClmmPositionAum(programs, entry, vault, prices) {
  const zeroResult = { positionType: PositionType.ClmmPosition, mint: vault.underlyingMint.toBase58(), aum: 0n }
  try {
    const { lpPosition, market, ticks } = await fetchClmmPositionContext(programs, entry)
    if (!lpPosition.market.equals(entry.market) || lpPosition.lpBalance === 0n) return zeroResult
    const { totalPtOut, totalSyOut } = getPtAndSyOnWithdrawLiquidity(market.emissions, ticks, lpPosition, lpPosition.lpBalance)
    const finalPt = totalPtOut + lpPosition.tokensOwedPt
    const finalSy = totalSyOut + lpPosition.tokensOwedSy
    const totalValue = resolvePrice(entry.priceIdPt, prices)
      .times(finalPt.toString())
      .plus(resolvePrice(entry.priceIdSy, prices).times(finalSy.toString()))
    return {
      positionType: PositionType.ClmmPosition,
      mint: vault.underlyingMint.toBase58(),
      aum: decimalFloorToBigInt(totalValue),
      clmmPositionExposure: {
        ptAmount: finalPt,
        syAmount: finalSy,
        clmmMarket: lpPosition.market.toBase58(),
        positionAddress: entry.lpPosition.toBase58(),
        lowerTickIdx: lpPosition.lowerTickIdx,
        upperTickIdx: lpPosition.upperTickIdx,
      },
    }
  } catch (error) {
    console.warn('Failed to calculate CLMM position AUM:', error)
    return zeroResult
  }
}

function parseLoopscaleLoan(data) {
  const buffer = Buffer.from(data)
  const ledgersOffset = LOOPSCALE_DISCRIMINATOR_LEN + LOOPSCALE_LOAN_HEADER_LEN
  const collateralOffset = ledgersOffset + LOOPSCALE_LEDGER_LEN * LOOPSCALE_LEDGER_COUNT
  const requiredLen = collateralOffset + LOOPSCALE_COLLATERAL_LEN * LOOPSCALE_COLLATERAL_COUNT
  if (buffer.length < requiredLen) throw new Error('Loopscale loan account data too short')
  if (!buffer.subarray(0, LOOPSCALE_DISCRIMINATOR_LEN).equals(LOOPSCALE_LOAN_DISCRIMINATOR)) {
    throw new Error('Invalid Loopscale loan discriminator')
  }

  const ledgers = []
  for (let i = 0; i < LOOPSCALE_LEDGER_COUNT; i += 1) {
    const offset = ledgersOffset + i * LOOPSCALE_LEDGER_LEN
    ledgers.push({
      principalMint: new PublicKey(buffer.subarray(offset + 33, offset + 65)),
      principalDue: buffer.readBigUInt64LE(offset + 97),
      principalRepaid: buffer.readBigUInt64LE(offset + 105),
      interestOutstanding: buffer.readBigUInt64LE(offset + 113),
      lastInterestUpdatedTime: buffer.readBigUInt64LE(offset + 121),
      interestPerSecond: readBigUIntLE(buffer, offset + 134, 24),
    })
  }

  const collateral = []
  for (let i = 0; i < LOOPSCALE_COLLATERAL_COUNT; i += 1) {
    const offset = collateralOffset + i * LOOPSCALE_COLLATERAL_LEN
    collateral.push({
      assetMint: new PublicKey(buffer.subarray(offset, offset + 32)),
      amount: buffer.readBigUInt64LE(offset + 32),
    })
  }

  return { ledgers, collateral }
}

function calculateLoopscaleUnaccruedInterest(ledger, valuationClock) {
  if (ledger.interestPerSecond === 0n) return 0n
  const currentUnixTimestamp = valuationClock.currentUnixTimestamp
  if (currentUnixTimestamp < ledger.lastInterestUpdatedTime) {
    throw new Error('Loopscale loan ledger has future last interest update timestamp')
  }
  return (ledger.interestPerSecond * (currentUnixTimestamp - ledger.lastInterestUpdatedTime)) / LOOPSCALE_DECIMAL_SCALE
}

async function calculateLoopscaleLoanAum(programs, entry, vault, prices, valuationClock) {
  const mint = vault.underlyingMint.toBase58()
  try {
    const info = await programs.cache.getAccountInfo(entry.loan)
    if (!info?.data) return { positionType: PositionType.LoopscaleLoan, mint, aum: 0n }
    if (!info.owner?.equals(programs.loopscale.programId)) throw new Error('Loopscale loan account owner mismatch')

    const loan = parseLoopscaleLoan(info.data)
    const mintPriceMap = new Map((vault.tokenEntries || []).map((tokenEntry) => [
      tokenEntry.mint.toBase58(),
      tokenEntry.priceId,
    ]))
    const exposureByMint = new Map()
    let collateralValue = new BigNumber(0)
    let debtValue = new BigNumber(0)

    for (const collateral of loan.collateral) {
      const collateralMint = collateral.assetMint.toBase58()
      if (collateral.assetMint.equals(DEFAULT_PUBLIC_KEY) || collateral.amount === 0n) continue
      const priceId = mintPriceMap.get(collateralMint)
      if (!priceId) continue

      const value = resolvePrice(priceId, prices).times(collateral.amount.toString())
      collateralValue = collateralValue.plus(value)
      exposureByMint.set(collateralMint, (exposureByMint.get(collateralMint) || 0n) + decimalFloorToBigInt(value))
    }

    for (const ledger of loan.ledgers) {
      const liveInterest = ledger.interestOutstanding + calculateLoopscaleUnaccruedInterest(ledger, valuationClock)
      const outstanding = ledger.principalDue > ledger.principalRepaid
        ? ledger.principalDue - ledger.principalRepaid + liveInterest
        : liveInterest
      if (outstanding === 0n) continue

      const principalMint = ledger.principalMint.toBase58()
      const priceId = mintPriceMap.get(principalMint)
      if (!priceId) continue

      const value = resolvePrice(priceId, prices).times(outstanding.toString())
      debtValue = debtValue.plus(value)
      exposureByMint.set(principalMint, (exposureByMint.get(principalMint) || 0n) - decimalFloorToBigInt(value))
    }

    return {
      positionType: PositionType.LoopscaleLoan,
      mint,
      aum: decimalFloorToBigInt(BigNumber.max(collateralValue.minus(debtValue), 0)),
      loopscaleLoanExposure: Array.from(exposureByMint.entries()).map(([exposureMint, amount]) => ({
        mint: exposureMint,
        amount,
      })),
    }
  } catch (error) {
    console.warn('Failed to calculate Loopscale loan AUM:', error)
    return { positionType: PositionType.LoopscaleLoan, mint, aum: 0n }
  }
}

async function calculateLoopscaleStrategyAum(programs, entry, vault, prices) {
  const underlyingMint = vault.underlyingMint.toBase58()
  try {
    const strategy = await programs.cache.fetchAccount(programs.loopscale, 'strategy', entry.strategy)
    const principalMint = strategy.principalMint.toBase58()
    const totalValue =
      bnToBigInt(strategy.tokenBalance) +
      bnToBigInt(strategy.currentDeployedAmount) +
      bnToBigInt(strategy.outstandingInterestAmount)
    if (totalValue === 0n) return { positionType: PositionType.LoopscaleStrategy, mint: principalMint, aum: 0n }

    const tokenEntry = (vault.tokenEntries || []).find((candidate) => candidate.mint.toBase58() === principalMint)
    if (!tokenEntry) return { positionType: PositionType.LoopscaleStrategy, mint: principalMint, aum: 0n }
    return {
      positionType: PositionType.LoopscaleStrategy,
      mint: principalMint,
      aum: decimalFloorToBigInt(resolvePrice(tokenEntry.priceId, prices).times(totalValue.toString())),
    }
  } catch (error) {
    console.warn('Failed to calculate Loopscale strategy AUM:', error)
    return { positionType: PositionType.LoopscaleStrategy, mint: underlyingMint, aum: 0n }
  }
}

async function calculateKaminoFarmAum(programs, entry, vault, prices, valuationClock) {
  const zeroResult = { positionType: PositionType.KaminoFarm, mint: vault.underlyingMint.toBase58(), aum: 0n }
  try {
    const [farmInfo, userInfo] = await programs.cache.getMultipleAccountsInfo([entry.farmState, entry.userState])
    if (!farmInfo?.data || !userInfo?.data) return zeroResult

    const farm = decodeKaminoFarmState(Buffer.from(farmInfo.data))
    if (farm.isDelegated) return zeroResult

    const user = decodeKaminoFarmUserState(Buffer.from(userInfo.data))
    const principalAmount = calculateKaminoFarmPrincipalAmount(farm, user)
    const principalPriceId = resolveMintPriceId(vault, farm.underlyingMint, prices)
    if (!principalPriceId) throw new Error(`Missing Exponent price for Kamino farm underlying mint ${farm.underlyingMint.toBase58()}`)

    let valueInBase = resolvePrice(principalPriceId, prices).times(principalAmount.toString())
    if (farm.numRewardTokens > 0) {
      const additionalAccounts = [farm.globalConfig]
      const scopePricesAddress = getKaminoFarmScopePricesAddress(farm)
      if (scopePricesAddress) additionalAccounts.push(scopePricesAddress)

      const [globalConfigInfo, scopeInfo] = await programs.cache.getMultipleAccountsInfo(additionalAccounts)
      if (!globalConfigInfo?.data) throw new Error(`Missing Kamino farm global config ${farm.globalConfig.toBase58()}`)
      if (scopePricesAddress && !scopeInfo?.data) throw new Error(`Missing scope prices account ${scopePricesAddress.toBase58()}`)

      valueInBase = valueInBase.plus(calculateKaminoFarmRewardValueInBase({
        farm,
        user,
        globalConfigData: Buffer.from(globalConfigInfo.data),
        scopePriceData: scopeInfo?.data ? Buffer.from(scopeInfo.data) : null,
        prices,
        valuationClock,
        vault,
      }))
    }

    return {
      positionType: PositionType.KaminoFarm,
      mint: farm.underlyingMint.toBase58(),
      aum: decimalFloorToBigInt(valueInBase),
    }
  } catch (error) {
    console.warn('Failed to calculate Kamino farm AUM:', error)
    return zeroResult
  }
}

async function calculatePositionAum(programs, position, vault, prices, valuationClock) {
  if (position.tokenAccount) return calculateTokenAccountAum(programs, tupleValue(position.tokenAccount), prices)
  if (position.orderbook) return calculateOrderbookAum(programs, tupleValue(position.orderbook), vault, prices)
  if (position.yieldPosition) return [await calculateYieldPositionAum(programs, tupleValue(position.yieldPosition), vault, prices)]
  if (position.obligation) {
    const inner = tupleValue(position.obligation)
    const entry = tupleValue(inner?.kaminoObligation) || inner?.kaminoObligation
    return entry ? [await calculateKaminoObligationAum(programs, entry, vault, prices, valuationClock)] : []
  }
  if (position.clmmPosition) return [await calculateClmmPositionAum(programs, tupleValue(position.clmmPosition), vault, prices)]
  if (position.loopscaleStrategy) return [await calculateLoopscaleStrategyAum(programs, tupleValue(position.loopscaleStrategy), vault, prices)]
  if (position.loopscaleLoan) return [await calculateLoopscaleLoanAum(programs, tupleValue(position.loopscaleLoan), vault, prices, valuationClock)]
  if (position.kaminoFarm) {
    return [await calculateKaminoFarmAum(programs, tupleValue(position.kaminoFarm), vault, prices, valuationClock)]
  }
  return []
}

async function calculateStrategyVaultPositionsAum(programs, vault, prices, valuationClock) {
  const resolvedValuationClock = valuationClock || await getCurrentValuationClock(programs.connection)
  const results = [...await calculateReserveTokensAum(programs, vault, prices)]
  for (const position of vault.strategyPositions || []) {
    results.push(...await calculatePositionAum(programs, position, vault, prices, resolvedValuationClock))
  }
  return results
}

module.exports = {
  PositionType,
  calculateStrategyVaultPositionsAum,
  getCurrentValuationClock,
  getTotalAum,
}
