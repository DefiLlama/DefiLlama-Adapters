const {
    struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128,
  } = require('./layout-base')
  
  const BYREAL_REWARD_INFO = struct([
    u8("rewardState"),
    u64("openTime"),
    u64("endTime"),
    u64("lastUpdateTime"),
    u128("emissionsPerSecondX64"),
    u64("rewardTotalEmissioned"),
    u64("rewardClaimed"),
    publicKey("tokenMint"),
    publicKey("tokenVault"),
    publicKey("authority"),
    u128("rewardGrowthGlobalX64"),
  ]);
  
const BYREAL_LIQUIDITY_STATE_LAYOUT_CLMM = struct([
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
  
    seq(BYREAL_REWARD_INFO, 3, "rewardInfos"),
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
  
  module.exports = {
    BYREAL_LIQUIDITY_STATE_LAYOUT_CLMM
  }
  