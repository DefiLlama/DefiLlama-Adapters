const { PublicKey } = require('@solana/web3.js')

const U64_MAX = 18_446_744_073_709_551_615n
const DECIMAL_WAD = 1_000_000_000_000_000_000n
const BPS_DIV_FACTOR = 10_000n
const DEFAULT_PUBLIC_KEY = PublicKey.default

const KAMINO_FARM_ACCOUNT_DISCRIMINATOR_LEN = 8
const KAMINO_FARM_USER_STATE_DISCRIMINATOR = Uint8Array.from([72, 177, 85, 249, 76, 167, 186, 126])
const KAMINO_FARM_GLOBAL_CONFIG_OFFSET = 32
const KAMINO_FARM_GLOBAL_CONFIG_TREASURY_FEE_BPS_OFFSET = 32
const KAMINO_FARM_TOKEN_MINT_OFFSET = 64
const KAMINO_FARM_TOKEN_PROGRAM_OFFSET = 104
const KAMINO_FARM_REWARD_INFOS_OFFSET = 184
const KAMINO_FARM_REWARD_INFO_SIZE = 704
const KAMINO_FARM_REWARD_TOKEN_MINT_OFFSET = 0
const KAMINO_FARM_REWARD_TOKEN_PROGRAM_OFFSET = 40
const KAMINO_FARM_REWARD_VAULT_OFFSET = 120
const KAMINO_FARM_REWARDS_AVAILABLE_OFFSET = 152
const KAMINO_FARM_REWARD_SCHEDULE_CURVE_OFFSET = 160
const KAMINO_FARM_REWARD_SCHEDULE_CURVE_POINTS = 20
const KAMINO_FARM_REWARD_SCHEDULE_CURVE_POINT_SIZE = 16
const KAMINO_FARM_LAST_ISSUANCE_TS_OFFSET = 488
const KAMINO_FARM_REWARDS_ISSUED_UNCLAIMED_OFFSET = 496
const KAMINO_FARM_REWARDS_ISSUED_CUMULATIVE_OFFSET = 504
const KAMINO_FARM_REWARD_PER_SHARE_SCALED_OFFSET = 512
const KAMINO_FARM_REWARD_TYPE_OFFSET = 536
const KAMINO_FARM_REWARDS_PER_SECOND_DECIMALS_OFFSET = 537
const KAMINO_FARM_NUM_REWARD_TOKENS_OFFSET = 7224
const KAMINO_FARM_TOTAL_STAKED_AMOUNT_OFFSET = 7240
const KAMINO_FARM_FARM_VAULT_OFFSET = 7248
const KAMINO_FARM_FARM_VAULTS_AUTHORITY_OFFSET = 7280
const KAMINO_FARM_FARM_VAULTS_AUTHORITY_BUMP_OFFSET = 7312
const KAMINO_FARM_DELEGATE_AUTHORITY_OFFSET = 7320
const KAMINO_FARM_TIME_UNIT_OFFSET = 7352
const KAMINO_FARM_IS_FARM_DELEGATED_OFFSET = 7354
const KAMINO_FARM_DEPOSIT_WARMUP_PERIOD_OFFSET = 7392
const KAMINO_FARM_WITHDRAWAL_COOLDOWN_PERIOD_OFFSET = 7396
const KAMINO_FARM_TOTAL_ACTIVE_STAKE_SCALED_OFFSET = 7400
const KAMINO_FARM_TOTAL_PENDING_STAKE_SCALED_OFFSET = 7416
const KAMINO_FARM_TOTAL_PENDING_AMOUNT_OFFSET = 7432
const KAMINO_FARM_SCOPE_PRICES_OFFSET = 7528
const KAMINO_FARM_SCOPE_ORACLE_PRICE_ID_OFFSET = 7560
const KAMINO_FARM_SCOPE_ORACLE_MAX_AGE_OFFSET = 7568

const KAMINO_FARM_USER_OWNER_OFFSET = 40
const KAMINO_FARM_USER_REWARDS_TALLY_SCALED_OFFSET = 80
const KAMINO_FARM_USER_REWARDS_ISSUED_UNCLAIMED_OFFSET = 240
const KAMINO_FARM_USER_LAST_CLAIM_TS_OFFSET = 320
const KAMINO_FARM_USER_ACTIVE_STAKE_SCALED_OFFSET = 400
const KAMINO_FARM_USER_PENDING_DEPOSIT_STAKE_SCALED_OFFSET = 416
const KAMINO_FARM_USER_PENDING_WITHDRAWAL_UNSTAKE_SCALED_OFFSET = 440
const KAMINO_FARM_USER_DELEGATEE_OFFSET = 472

const KAMINO_SCOPE_ACCOUNT_DISCRIMINATOR_LEN = 8
const KAMINO_SCOPE_ORACLE_PRICES_ARRAY_OFFSET = 32
const KAMINO_SCOPE_DATED_PRICE_SIZE = 56
const KAMINO_SCOPE_PRICE_VALUE_OFFSET = 0
const KAMINO_SCOPE_PRICE_EXP_OFFSET = 8
const KAMINO_SCOPE_LAST_UPDATED_SLOT_OFFSET = 16
const KAMINO_SCOPE_UNIX_TIMESTAMP_OFFSET = 24

const KaminoFarmTimeUnit = {
  Seconds: 0,
  Slots: 1,
}

const KaminoFarmRewardType = {
  Proportional: 0,
  Constant: 1,
}

function readPubkey(data, offset) {
  return new PublicKey(data.subarray(offset, offset + 32))
}

function readU32LE(data, offset) {
  return new DataView(data.buffer, data.byteOffset + offset, 4).getUint32(0, true)
}

function readU64LE(data, offset) {
  return new DataView(data.buffer, data.byteOffset + offset, 8).getBigUint64(0, true)
}

function readU128LE(data, offset) {
  return readU64LE(data, offset) + (readU64LE(data, offset + 8) << 64n)
}

function tenPow(exp) {
  const powers = [
    1n,
    10n,
    100n,
    1_000n,
    10_000n,
    100_000n,
    1_000_000n,
    10_000_000n,
    100_000_000n,
    1_000_000_000n,
    10_000_000_000n,
    100_000_000_000n,
    1_000_000_000_000n,
    10_000_000_000_000n,
    100_000_000_000_000n,
    1_000_000_000_000_000n,
    10_000_000_000_000_000n,
    100_000_000_000_000_000n,
    1_000_000_000_000_000_000n,
    10_000_000_000_000_000_000n,
  ]
  if (exp < 0 || exp >= powers.length) throw new Error(`Invalid power-of-ten exponent ${exp}`)
  return powers[exp]
}

function decodeKaminoFarmState(data) {
  const base = KAMINO_FARM_ACCOUNT_DISCRIMINATOR_LEN
  const numRewardTokens = Number(readU64LE(data, base + KAMINO_FARM_NUM_REWARD_TOKENS_OFFSET))
  if (numRewardTokens < 0 || numRewardTokens > 10) throw new Error(`Invalid Kamino farm reward count: ${numRewardTokens}`)

  const rewardInfos = []
  for (let i = 0; i < numRewardTokens; i += 1) {
    const rewardBase = base + KAMINO_FARM_REWARD_INFOS_OFFSET + (i * KAMINO_FARM_REWARD_INFO_SIZE)
    const rewardScheduleCurve = []
    for (let pointIndex = 0; pointIndex < KAMINO_FARM_REWARD_SCHEDULE_CURVE_POINTS; pointIndex += 1) {
      const pointBase = rewardBase
        + KAMINO_FARM_REWARD_SCHEDULE_CURVE_OFFSET
        + (pointIndex * KAMINO_FARM_REWARD_SCHEDULE_CURVE_POINT_SIZE)
      rewardScheduleCurve.push({
        tsStart: readU64LE(data, pointBase),
        rewardPerTimeUnit: readU64LE(data, pointBase + 8),
      })
    }

    rewardInfos.push({
      rewardMint: readPubkey(data, rewardBase + KAMINO_FARM_REWARD_TOKEN_MINT_OFFSET),
      tokenProgram: readPubkey(data, rewardBase + KAMINO_FARM_REWARD_TOKEN_PROGRAM_OFFSET),
      rewardsVault: readPubkey(data, rewardBase + KAMINO_FARM_REWARD_VAULT_OFFSET),
      rewardsAvailable: readU64LE(data, rewardBase + KAMINO_FARM_REWARDS_AVAILABLE_OFFSET),
      rewardScheduleCurve,
      lastIssuanceTs: readU64LE(data, rewardBase + KAMINO_FARM_LAST_ISSUANCE_TS_OFFSET),
      rewardsIssuedUnclaimed: readU64LE(data, rewardBase + KAMINO_FARM_REWARDS_ISSUED_UNCLAIMED_OFFSET),
      rewardsIssuedCumulative: readU64LE(data, rewardBase + KAMINO_FARM_REWARDS_ISSUED_CUMULATIVE_OFFSET),
      rewardPerShareScaled: readU128LE(data, rewardBase + KAMINO_FARM_REWARD_PER_SHARE_SCALED_OFFSET),
      rewardType: data[rewardBase + KAMINO_FARM_REWARD_TYPE_OFFSET],
      rewardsPerSecondDecimals: data[rewardBase + KAMINO_FARM_REWARDS_PER_SECOND_DECIMALS_OFFSET],
    })
  }

  const delegateAuthority = readPubkey(data, base + KAMINO_FARM_DELEGATE_AUTHORITY_OFFSET)
  return {
    globalConfig: readPubkey(data, base + KAMINO_FARM_GLOBAL_CONFIG_OFFSET),
    underlyingMint: readPubkey(data, base + KAMINO_FARM_TOKEN_MINT_OFFSET),
    tokenProgram: readPubkey(data, base + KAMINO_FARM_TOKEN_PROGRAM_OFFSET),
    farmVault: readPubkey(data, base + KAMINO_FARM_FARM_VAULT_OFFSET),
    farmVaultsAuthority: readPubkey(data, base + KAMINO_FARM_FARM_VAULTS_AUTHORITY_OFFSET),
    farmVaultsAuthorityBump: readU64LE(data, base + KAMINO_FARM_FARM_VAULTS_AUTHORITY_BUMP_OFFSET),
    delegateAuthority,
    timeUnit: data[base + KAMINO_FARM_TIME_UNIT_OFFSET],
    isDelegated: data[base + KAMINO_FARM_IS_FARM_DELEGATED_OFFSET] !== 0 || !delegateAuthority.equals(DEFAULT_PUBLIC_KEY),
    depositWarmupPeriod: readU32LE(data, base + KAMINO_FARM_DEPOSIT_WARMUP_PERIOD_OFFSET),
    withdrawalCooldownPeriod: readU32LE(data, base + KAMINO_FARM_WITHDRAWAL_COOLDOWN_PERIOD_OFFSET),
    totalStakedAmount: readU64LE(data, base + KAMINO_FARM_TOTAL_STAKED_AMOUNT_OFFSET),
    totalActiveStakeScaled: readU128LE(data, base + KAMINO_FARM_TOTAL_ACTIVE_STAKE_SCALED_OFFSET),
    totalPendingStakeScaled: readU128LE(data, base + KAMINO_FARM_TOTAL_PENDING_STAKE_SCALED_OFFSET),
    totalPendingAmount: readU64LE(data, base + KAMINO_FARM_TOTAL_PENDING_AMOUNT_OFFSET),
    numRewardTokens,
    scopePrices: readPubkey(data, base + KAMINO_FARM_SCOPE_PRICES_OFFSET),
    scopeOraclePriceId: readU64LE(data, base + KAMINO_FARM_SCOPE_ORACLE_PRICE_ID_OFFSET),
    scopeOracleMaxAge: readU64LE(data, base + KAMINO_FARM_SCOPE_ORACLE_MAX_AGE_OFFSET),
    rewardInfos,
  }
}

function decodeKaminoFarmUserState(data) {
  const base = KAMINO_FARM_ACCOUNT_DISCRIMINATOR_LEN
  const rewardsTallyScaled = []
  const rewardsIssuedUnclaimed = []
  const lastClaimTs = []
  for (let i = 0; i < 10; i += 1) {
    rewardsTallyScaled.push(readU128LE(data, base + KAMINO_FARM_USER_REWARDS_TALLY_SCALED_OFFSET + (i * 16)))
    rewardsIssuedUnclaimed.push(readU64LE(data, base + KAMINO_FARM_USER_REWARDS_ISSUED_UNCLAIMED_OFFSET + (i * 8)))
    lastClaimTs.push(readU64LE(data, base + KAMINO_FARM_USER_LAST_CLAIM_TS_OFFSET + (i * 8)))
  }

  return {
    owner: readPubkey(data, base + KAMINO_FARM_USER_OWNER_OFFSET),
    rewardsTallyScaled,
    rewardsIssuedUnclaimed,
    lastClaimTs,
    activeStakeScaled: readU128LE(data, base + KAMINO_FARM_USER_ACTIVE_STAKE_SCALED_OFFSET),
    pendingDepositStakeScaled: readU128LE(data, base + KAMINO_FARM_USER_PENDING_DEPOSIT_STAKE_SCALED_OFFSET),
    pendingWithdrawalUnstakeScaled: readU128LE(data, base + KAMINO_FARM_USER_PENDING_WITHDRAWAL_UNSTAKE_SCALED_OFFSET),
    delegatee: readPubkey(data, base + KAMINO_FARM_USER_DELEGATEE_OFFSET),
  }
}

function decodeOptionalKaminoFarmUserState(data) {
  const discriminator = data.subarray(0, KAMINO_FARM_ACCOUNT_DISCRIMINATOR_LEN)
  if (
    discriminator.length !== KAMINO_FARM_USER_STATE_DISCRIMINATOR.length
    || discriminator.some((value, index) => value !== KAMINO_FARM_USER_STATE_DISCRIMINATOR[index])
  ) {
    return null
  }
  return decodeKaminoFarmUserState(data)
}

function decodeKaminoScopeDatedPrice(data, priceId) {
  const priceOffset = KAMINO_SCOPE_ACCOUNT_DISCRIMINATOR_LEN
    + KAMINO_SCOPE_ORACLE_PRICES_ARRAY_OFFSET
    + (Number(priceId) * KAMINO_SCOPE_DATED_PRICE_SIZE)
  return {
    value: readU64LE(data, priceOffset + KAMINO_SCOPE_PRICE_VALUE_OFFSET),
    exp: readU64LE(data, priceOffset + KAMINO_SCOPE_PRICE_EXP_OFFSET),
    lastUpdatedSlot: readU64LE(data, priceOffset + KAMINO_SCOPE_LAST_UPDATED_SLOT_OFFSET),
    unixTimestamp: readU64LE(data, priceOffset + KAMINO_SCOPE_UNIX_TIMESTAMP_OFFSET),
  }
}

function kaminoFarmUsesScopeOracle(farm) {
  return farm.scopeOraclePriceId !== U64_MAX
}

function getKaminoFarmScopePricesAddress(farm) {
  if (!kaminoFarmUsesScopeOracle(farm) || farm.scopePrices.equals(DEFAULT_PUBLIC_KEY)) return null
  return farm.scopePrices
}

function getCurrentFarmTs(farm, valuationClock) {
  return farm.timeUnit === KaminoFarmTimeUnit.Slots
    ? valuationClock.currentSlot
    : valuationClock.currentUnixTimestamp
}

function convertKaminoStakeToAmount(stake, totalStake, totalAmount) {
  if (stake === 0n) return 0n
  if (totalStake === 0n) return totalAmount
  return (stake * totalAmount) / totalStake
}

function calculateKaminoFarmPrincipalAmount(farm, user) {
  const activeAmount = convertKaminoStakeToAmount(
    user.activeStakeScaled,
    farm.totalActiveStakeScaled,
    farm.totalStakedAmount,
  )
  const pendingStake = user.pendingDepositStakeScaled + user.pendingWithdrawalUnstakeScaled
  const pendingAmount = convertKaminoStakeToAmount(
    pendingStake,
    farm.totalPendingStakeScaled,
    farm.totalPendingAmount,
  )
  return activeAmount + pendingAmount
}

function getCumulativeAmountIssuedSinceLastTs(rewardScheduleCurve, lastIssuedTs, currentTs) {
  if (lastIssuedTs > currentTs) throw new Error('Kamino farm reward schedule has lastIssuedTs > currentTs')

  let startIndex = rewardScheduleCurve.length - 1
  for (let i = 0; i < rewardScheduleCurve.length; i += 1) {
    if (rewardScheduleCurve[i].tsStart > lastIssuedTs) {
      if (i === 0) throw new Error('Kamino farm reward schedule first point starts after lastIssuedTs')
      startIndex = i - 1
      break
    }
  }

  let cumulativeAmount = 0n
  for (let i = startIndex; i < rewardScheduleCurve.length; i += 1) {
    const point = rewardScheduleCurve[i]
    if (point.tsStart >= currentTs) break

    const startTs = point.tsStart > lastIssuedTs ? point.tsStart : lastIssuedTs
    const endTs = i < rewardScheduleCurve.length - 1 && rewardScheduleCurve[i + 1].tsStart < currentTs
      ? rewardScheduleCurve[i + 1].tsStart
      : currentTs
    cumulativeAmount += point.rewardPerTimeUnit * (endTs - startTs)
  }

  return cumulativeAmount
}

function applyKaminoFarmScopePrice(farm, amount, scopePrice, currentTs) {
  if (!kaminoFarmUsesScopeOracle(farm)) return amount
  if (!scopePrice) throw new Error(`Missing scope prices for Kamino farm ${farm.scopePrices.toBase58()}`)
  if (currentTs < scopePrice.unixTimestamp) throw new Error('Kamino farm scope price timestamp is in the future')
  if (currentTs - scopePrice.unixTimestamp > farm.scopeOracleMaxAge) throw new Error('Kamino farm scope price is too old')
  return (amount * scopePrice.value) / tenPow(Number(scopePrice.exp))
}

function projectKaminoFarmGlobalReward(farm, rewardInfo, scopePrice, valuationClock) {
  const currentTs = getCurrentFarmTs(farm, valuationClock)
  if (currentTs === rewardInfo.lastIssuanceTs) return rewardInfo
  if (farm.totalActiveStakeScaled === 0n) return { ...rewardInfo, lastIssuanceTs: currentTs }

  const cumulativeAmount = getCumulativeAmountIssuedSinceLastTs(
    rewardInfo.rewardScheduleCurve,
    rewardInfo.lastIssuanceTs,
    currentTs,
  )
  const rewardTypeAmount = rewardInfo.rewardType === KaminoFarmRewardType.Constant
    ? cumulativeAmount * farm.totalStakedAmount
    : cumulativeAmount
  const decimalAdjustedAmount = rewardTypeAmount / tenPow(rewardInfo.rewardsPerSecondDecimals)
  const oracleAdjustedAmount = applyKaminoFarmScopePrice(farm, decimalAdjustedAmount, scopePrice, currentTs)

  if (oracleAdjustedAmount === 0n) return rewardInfo

  const rewards = oracleAdjustedAmount < rewardInfo.rewardsAvailable
    ? oracleAdjustedAmount
    : rewardInfo.rewardsAvailable
  const rewardTimesWad = rewards * DECIMAL_WAD
  const addedRewardPerShareScaled = farm.isDelegated
    ? rewardTimesWad / farm.totalActiveStakeScaled
    : (rewardTimesWad * DECIMAL_WAD) / farm.totalActiveStakeScaled

  return {
    ...rewardInfo,
    lastIssuanceTs: currentTs,
    rewardsIssuedUnclaimed: rewardInfo.rewardsIssuedUnclaimed + rewards,
    rewardsIssuedCumulative: rewardInfo.rewardsIssuedCumulative + rewards,
    rewardsAvailable: rewardInfo.rewardsAvailable - rewards,
    rewardPerShareScaled: rewardInfo.rewardPerShareScaled + addedRewardPerShareScaled,
  }
}

function projectKaminoFarmGlobalRewards(farm, scopePrice, valuationClock) {
  return farm.rewardInfos.map((rewardInfo) =>
    projectKaminoFarmGlobalReward(farm, rewardInfo, scopePrice, valuationClock),
  )
}

function projectKaminoFarmUserReward(farm, user, rewardInfo, rewardIndex) {
  const rewardsTallyScaled = user.rewardsTallyScaled[rewardIndex] || 0n
  const rewardsIssuedUnclaimed = user.rewardsIssuedUnclaimed[rewardIndex] || 0n
  const rewardPerShareTimesStake = rewardInfo.rewardPerShareScaled * user.activeStakeScaled
  const newRewardTallyScaled = farm.isDelegated
    ? rewardPerShareTimesStake
    : rewardPerShareTimesStake / DECIMAL_WAD
  if (newRewardTallyScaled < rewardsTallyScaled) {
    return { rewardsTallyScaled, rewardsIssuedUnclaimed }
  }
  const reward = (newRewardTallyScaled - rewardsTallyScaled) / DECIMAL_WAD
  return {
    rewardsTallyScaled: rewardsTallyScaled + (reward * DECIMAL_WAD),
    rewardsIssuedUnclaimed: rewardsIssuedUnclaimed + reward,
  }
}

function projectKaminoFarmUserRewards(farm, user, projectedRewardInfos) {
  const projectedRewardsTallyScaled = [...user.rewardsTallyScaled]
  const projectedRewardsIssuedUnclaimed = [...user.rewardsIssuedUnclaimed]
  if (user.activeStakeScaled === 0n) {
    return { projectedRewardInfos, projectedRewardsTallyScaled, projectedRewardsIssuedUnclaimed }
  }

  for (let rewardIndex = 0; rewardIndex < farm.numRewardTokens; rewardIndex += 1) {
    const projected = projectKaminoFarmUserReward(farm, user, projectedRewardInfos[rewardIndex], rewardIndex)
    projectedRewardsTallyScaled[rewardIndex] = projected.rewardsTallyScaled
    projectedRewardsIssuedUnclaimed[rewardIndex] = projected.rewardsIssuedUnclaimed
  }

  return { projectedRewardInfos, projectedRewardsTallyScaled, projectedRewardsIssuedUnclaimed }
}

function applyKaminoFarmTreasuryFee(reward, treasuryFeeBps) {
  const rewardTreasury = (reward * treasuryFeeBps) / BPS_DIV_FACTOR
  return reward - rewardTreasury
}

module.exports = {
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
}
