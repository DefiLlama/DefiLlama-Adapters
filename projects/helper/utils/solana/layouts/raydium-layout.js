const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128,
} = require('./layout-base')

const CP_SWAP_POOL_STATE_DISCRIMINATOR = Buffer.from([247, 237, 227, 245, 215, 195, 222, 70])

const RAYDIUM_REWARD_INFO = struct([
  u8("rewardState"),
  u64("openTime"),
  u64("endTime"),
  u64("lastUpdateTime"),
  u128("emissionsPerSecondX64"),
  u64("rewardTotalEmissioned"),
  u64("rewardClaimed"),
  publicKey("tokenMint"),
  publicKey("tokenVault"),
  publicKey("creator"),
  u128("rewardGrowthGlobalX64"),
])

const RAYDIUM_LIQUIDITY_STATE_LAYOUT_V4 = struct([
  u64('status'),
  u64('nonce'),
  u64('maxOrder'),
  u64('depth'),
  u64('baseDecimal'),
  u64('quoteDecimal'),
  u64('state'),
  u64('resetFlag'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('amountWaveRatio'),
  u64('baseLotSize'),
  u64('quoteLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('systemDecimalValue'),
  u64('minSeparateNumerator'),
  u64('minSeparateDenominator'),
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('pnlNumerator'),
  u64('pnlDenominator'),
  u64('swapFeeNumerator'),
  u64('swapFeeDenominator'),
  u64('baseNeedTakePnl'),
  u64('quoteNeedTakePnl'),
  u64('quoteTotalPnl'),
  u64('baseTotalPnl'),
  u64('poolOpenTime'),
  u64('punishPcAmount'),
  u64('punishCoinAmount'),
  u64('orderbookToInitTime'),
  u128('swapBaseInAmount'),
  u128('swapQuoteOutAmount'),
  u64('swapBase2QuoteFee'),
  u128('swapQuoteInAmount'),
  u128('swapBaseOutAmount'),
  u64('swapQuote2BaseFee'),
  publicKey('baseVault'),
  publicKey('quoteVault'),
  publicKey('baseMint'),
  publicKey('quoteMint'),
  publicKey('lpMint'),
  publicKey('openOrders'),
  publicKey('marketId'),
  publicKey('marketProgramId'),
  publicKey('targetOrders'),
  publicKey('withdrawQueue'),
  publicKey('lpVault'),
  publicKey('owner'),
  u64('lpReserve'),
  seq(u64(), 3, 'padding'),
])

const RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM = struct([
  blob(8),
  u8("bump"),
  publicKey("ammConfig"),
  publicKey("creator"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("vaultA"),
  publicKey("vaultB"),
  publicKey("observationId"),
  u8("mintDecimalsA"),
  u8("mintDecimalsB"),
  u16("tickSpacing"),
  u128("liquidity"),
  u128("sqrtPriceX64"),
  s32("tickCurrent"),
  u16("observationIndex"),
  u16("observationUpdateDuration"),
  u128("feeGrowthGlobalX64A"),
  u128("feeGrowthGlobalX64B"),
  u64("protocolFeesTokenA"),
  u64("protocolFeesTokenB"),

  u128("swapInAmountTokenA"),
  u128("swapOutAmountTokenB"),
  u128("swapInAmountTokenB"),
  u128("swapOutAmountTokenA"),

  u8("status"),

  seq(u8(), 7, ""),

  seq(RAYDIUM_REWARD_INFO, 3, "rewardInfos"),
  seq(u64(), 16, 'tickArrayBitmap'),

  u64("totalFeesTokenA"),
  u64("totalFeesClaimedTokenA"),
  u64("totalFeesTokenB"),
  u64("totalFeesClaimedTokenB"),

  u64("fundFeesTokenA"),
  u64("fundFeesTokenB"),

  u64("startTime"),

  seq(u64(), 15 * 4 - 3, "padding"),
])

const RAYDIUM_STABLE_STATE_LAYOUT_V1 = struct([
  u64("accountType"),
  u64("status"),
  u64("nonce"),
  u64("maxOrder"),
  u64("depth"),
  u64("baseDecimal"),
  u64("quoteDecimal"),
  u64("state"),
  u64("resetFlag"),
  u64("minSize"),
  u64("volMaxCutRatio"),
  u64("amountWaveRatio"),
  u64("baseLotSize"),
  u64("quoteLotSize"),
  u64("minPriceMultiplier"),
  u64("maxPriceMultiplier"),
  u64("systemDecimalsValue"),
  u64("abortTradeFactor"),
  u64("priceTickMultiplier"),
  u64("priceTick"),
  // Fees
  u64("minSeparateNumerator"),
  u64("minSeparateDenominator"),
  u64("tradeFeeNumerator"),
  u64("tradeFeeDenominator"),
  u64("pnlNumerator"),
  u64("pnlDenominator"),
  u64("swapFeeNumerator"),
  u64("swapFeeDenominator"),
  // OutPutData
  u64("baseNeedTakePnl"),
  u64("quoteNeedTakePnl"),
  u64("quoteTotalPnl"),
  u64("baseTotalPnl"),
  u64("poolOpenTime"),
  u64("punishPcAmount"),
  u64("punishCoinAmount"),
  u64("orderbookToInitTime"),
  u128("swapBaseInAmount"),
  u128("swapQuoteOutAmount"),
  u128("swapQuoteInAmount"),
  u128("swapBaseOutAmount"),
  u64("swapQuote2BaseFee"),
  u64("swapBase2QuoteFee"),

  publicKey("baseVault"),
  publicKey("quoteVault"),
  publicKey("baseMint"),
  publicKey("quoteMint"),
  publicKey("lpMint"),

  publicKey("modelDataAccount"),
  publicKey("openOrders"),
  publicKey("marketId"),
  publicKey("marketProgramId"),
  publicKey("targetOrders"),
  publicKey("owner"),
  seq(u64("padding"), 64, "padding"),
])

const KeyLayoutv4 = struct([
  publicKey('vaultA'),
  publicKey('vaultB'),
  publicKey('mintA'),
  publicKey('mintB'),
])

const TokenAmountLayout = struct([
  u64('amount'),
])

const PositionRewardInfoLayout = struct([u128("growthInsideLastX64"), u64("rewardAmountOwed")]);
const RAYDIUM_POSITION_INFO_LAYOUT = struct([
  blob(8),
  u8("bump"),
  publicKey("nftMint"),
  publicKey("poolId"),

  s32("tickLower"),
  s32("tickUpper"),
  u128("liquidity"),
  u128("feeGrowthInsideLastX64A"),
  u128("feeGrowthInsideLastX64B"),
  u64("tokenFeesOwedA"),
  u64("tokenFeesOwedB"),

  seq(PositionRewardInfoLayout, 3, "rewardInfos"),

  seq(u64(), 8, ""),
]);

const RAYDIUM_CP_SWAP_POOL_STATE_LAYOUT = struct([
  blob(8, 'discriminator'),
  publicKey('ammConfig'),
  publicKey('poolCreator'),
  publicKey('token0Vault'),
  publicKey('token1Vault'),
  publicKey('lpMint'),
  publicKey('token0Mint'),
  publicKey('token1Mint'),
  publicKey('token0Program'),
  publicKey('token1Program'),
  publicKey('observationKey'),
  u8('authBump'),
  u8('status'),
  u8('lpMintDecimals'),
  u8('mint0Decimals'),
  u8('mint1Decimals'),
  u64('lpSupply'),
  u64('protocolFeesToken0'),
  u64('protocolFeesToken1'),
  u64('fundFeesToken0'),
  u64('fundFeesToken1'),
  u64('openTime'),
  u64('recentEpoch'),
  seq(u64(), 31, 'padding'),
])

function parseRaydiumCpSwapPoolState(info) {
  const data = Buffer.from(info.data)
  if (data.length < RAYDIUM_CP_SWAP_POOL_STATE_LAYOUT.span)
    throw new Error('Invalid Raydium CP-Swap PoolState account')
  const decoded = RAYDIUM_CP_SWAP_POOL_STATE_LAYOUT.decode(data)
  if (!Buffer.from(decoded.discriminator).equals(CP_SWAP_POOL_STATE_DISCRIMINATOR))
    throw new Error('Invalid Raydium CP-Swap PoolState discriminator')
  return decoded
}


module.exports = {
  RAYDIUM_LIQUIDITY_STATE_LAYOUT_V4,
  RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM, RAYDIUM_STABLE_STATE_LAYOUT_V1,
  KeyLayoutv4, TokenAmountLayout, RAYDIUM_POSITION_INFO_LAYOUT,
  parseRaydiumCpSwapPoolState,
}
