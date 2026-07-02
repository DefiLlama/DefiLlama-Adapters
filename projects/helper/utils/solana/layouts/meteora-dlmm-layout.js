const { struct, u8, u64, u128, s32, blob, publicKey, seq } = require('./layout-base')

const POSITION_V2_DISCRIMINATOR = Buffer.from([117, 176, 212, 199, 245, 180, 133, 182])
const LB_PAIR_DISCRIMINATOR = Buffer.from([33, 11, 49, 98, 181, 101, 177, 13])
const BIN_ARRAY_DISCRIMINATOR = Buffer.from([92, 142, 92, 220, 5, 148, 70, 181])
const BINS_PER_ARRAY = 70
const hasDiscriminator = (decoded, discriminator) => Buffer.from(decoded.discriminator).equals(discriminator)

const DLMM_FEE_INFO_LAYOUT = struct([
  u128('feeXPerTokenComplete'),
  u128('feeYPerTokenComplete'),
  u64('feeXPending'),
  u64('feeYPending'),
])

const DLMM_USER_REWARD_INFO_LAYOUT = struct([
  seq(u128(), 2, 'rewardPerTokenCompletes'),
  seq(u64(), 2, 'rewardPendings'),
])

const DLMM_BIN_LAYOUT = struct([
  u64('amountX'),
  u64('amountY'),
  u128('price'),
  u128('liquiditySupply'),
  seq(u128(), 2, 'functionBytes'),
  u128('feeAmountXPerTokenStored'),
  u128('feeAmountYPerTokenStored'),
  u128('padding0'),
  u128('padding1'),
])

const METEORA_BIN_ARRAY_LAYOUT = struct([
  blob(8, 'discriminator'),
  blob(8, 'indexRaw'),
  u8('version'),
  blob(7, 'padding1'),
  publicKey('lbPair'),
  seq(DLMM_BIN_LAYOUT, BINS_PER_ARRAY, 'bins'),
])

const METEORA_LB_PAIR_LAYOUT = struct([
  blob(8, 'discriminator'),
  blob(80, 'prefix'),
  publicKey('tokenXMint'),
  publicKey('tokenYMint'),
])

const METEORA_POSITION_V2_LAYOUT = struct([
  blob(8, 'discriminator'),
  publicKey('lbPair'),
  publicKey('owner'),
  seq(u128(), BINS_PER_ARRAY, 'liquidityShares'),
  seq(DLMM_USER_REWARD_INFO_LAYOUT, BINS_PER_ARRAY, 'rewardInfos'),
  seq(DLMM_FEE_INFO_LAYOUT, BINS_PER_ARRAY, 'feeInfos'),
  s32('lowerBinId'),
  s32('upperBinId'),
  u64('lastUpdatedAt'),
  u64('totalClaimedFeeXAmount'),
  u64('totalClaimedFeeYAmount'),
  seq(u64(), 2, 'totalClaimedRewards'),
  publicKey('operator'),
  u64('lockReleasePoint'),
  u8('padding0'),
  publicKey('feeOwner'),
  u8('version'),
  blob(86, 'reserved'),
])

const decodeSignedI64LE = (bytes) => {
  const value = bytes.readBigUInt64LE(0)
  return value >= 0x8000000000000000n ? value - 0x10000000000000000n : value
}

function parseMeteoraPosition(info) {
  const data = Buffer.from(info.data)
  if (data.length < METEORA_POSITION_V2_LAYOUT.span)
    throw new Error('Invalid Meteora Position length')
  const decoded = METEORA_POSITION_V2_LAYOUT.decode(data)
  if (!hasDiscriminator(decoded, POSITION_V2_DISCRIMINATOR))
    throw new Error('Invalid Meteora Position discriminator')
  return decoded
}

function parseMeteoraLbPair(info) {
  const data = Buffer.from(info.data)
  if (data.length < METEORA_LB_PAIR_LAYOUT.span)
    throw new Error('Invalid Meteora LbPair length')
  const decoded = METEORA_LB_PAIR_LAYOUT.decode(data)
  if (!hasDiscriminator(decoded, LB_PAIR_DISCRIMINATOR))
    throw new Error('Invalid Meteora LbPair discriminator')
  return decoded
}

function parseMeteoraBinArray(info) {
  const data = Buffer.from(info.data)
  if (data.length < METEORA_BIN_ARRAY_LAYOUT.span)
    throw new Error('Invalid Meteora BinArray length')
  const decoded = METEORA_BIN_ARRAY_LAYOUT.decode(data)
  if (!hasDiscriminator(decoded, BIN_ARRAY_DISCRIMINATOR))
    throw new Error('Invalid Meteora BinArray discriminator')
  return {
    ...decoded,
    index: decodeSignedI64LE(Buffer.from(decoded.indexRaw)),
  }
}

module.exports = {
  POSITION_V2_DISCRIMINATOR,
  LB_PAIR_DISCRIMINATOR,
  BIN_ARRAY_DISCRIMINATOR,
  parseMeteoraPosition,
  parseMeteoraLbPair,
  parseMeteoraBinArray,
}
