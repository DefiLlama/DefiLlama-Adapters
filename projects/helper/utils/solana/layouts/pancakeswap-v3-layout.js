const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128,
} = require('./layout-base')

const PANCAKESWAP_V3_POOL_LAYOUT = struct([
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
  seq(u8(), 7, "padding"),
])

module.exports = {
  PANCAKESWAP_V3_POOL_LAYOUT,
} 