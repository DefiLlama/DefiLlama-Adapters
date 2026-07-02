const { struct, u8, u64, blob, publicKey } = require('./layout-base')

const TOKEN_LOCK_DISCRIMINATOR = Buffer.from([73, 228, 144, 241, 154, 44, 93, 238])
const METEORA_TOKEN_LOCK_TAG = 3

const UNICRYPT_TOKEN_LOCK_BASE_LAYOUT = struct([
  blob(8, 'discriminator'),
  u8('bump'),
  publicKey('ammId'),
  publicKey('lpMint'),
  u64('lockGlobalId'),
  u64('lockDate'),
  u64('unlockDate'),
  u8('countryCode'),
  u64('initialLockAmount'),
  u64('currentLockedAmount'),
  publicKey('lockOwner'),
])

const UNICRYPT_TOKEN_LOCK_CLMM_LAYOUT = struct([
  blob(8, 'discriminator'),
  u8('bump'),
  publicKey('ammId'),
  publicKey('nftMintId'),
  publicKey('personalPositionNftId'),
  u64('lockGlobalId'),
  u64('lockDate'),
  u64('unlockDate'),
  u8('countryCode'),
  u64('initialLockAmountLow'),
  u64('initialLockAmountHigh'),
  u64('currentLockedAmountLow'),
  u64('currentLockedAmountHigh'),
  publicKey('lockOwner'),
  blob(2, 'feeProfileId'),
])

const METEORA_TOKEN_LOCK_LAYOUT = struct([
  u8('tag'),
  publicKey('lbPair'),
  publicKey('positionKey'),
  u64('lockGlobalId'),
  publicKey('lockOwner'),
  u64('lockDate'),
  u64('unlockDate'),
  blob(2, 'feeProfileId'),
  u8('bump'),
])

const hasDiscriminator = (decoded, discriminator) => Buffer.from(decoded.discriminator).equals(discriminator)
const toBase58 = (value) => (value && typeof value.toBase58 === 'function' ? value.toBase58() : value)

function parseUnicryptTokenLock(info) {
  const data = Buffer.from(info.data)
  if (data.length < UNICRYPT_TOKEN_LOCK_BASE_LAYOUT.span)
    throw new Error('Invalid Unicrypt TokenLock account')
  const decoded = UNICRYPT_TOKEN_LOCK_BASE_LAYOUT.decode(data)
  if (!hasDiscriminator(decoded, TOKEN_LOCK_DISCRIMINATOR))
    throw new Error('Invalid Unicrypt TokenLock discriminator')
  return decoded
}

function parseUnicryptTokenLockClmm(info) {
  const data = Buffer.from(info.data)
  if (data.length < UNICRYPT_TOKEN_LOCK_CLMM_LAYOUT.span)
    throw new Error('Invalid Unicrypt CLMM TokenLock account')
  const decoded = UNICRYPT_TOKEN_LOCK_CLMM_LAYOUT.decode(data)
  if (!hasDiscriminator(decoded, TOKEN_LOCK_DISCRIMINATOR))
    throw new Error('Invalid Unicrypt CLMM TokenLock discriminator')
  return decoded
}

function parseMeteoraTokenLock(info) {
  const data = Buffer.from(info.data)
  if (data.length < METEORA_TOKEN_LOCK_LAYOUT.span)
    throw new Error('Invalid Meteora TokenLock length')
  const decoded = METEORA_TOKEN_LOCK_LAYOUT.decode(data)
  if (decoded.tag !== METEORA_TOKEN_LOCK_TAG)
    throw new Error('Invalid Meteora TokenLock tag')
  return {
    ...decoded,
    lbPair: toBase58(decoded.lbPair),
    positionKey: toBase58(decoded.positionKey),
    lockOwner: toBase58(decoded.lockOwner),
  }
}

module.exports = {
  TOKEN_LOCK_DISCRIMINATOR,
  METEORA_TOKEN_LOCK_TAG,
  parseUnicryptTokenLock,
  parseUnicryptTokenLockClmm,
  parseMeteoraTokenLock,
}
