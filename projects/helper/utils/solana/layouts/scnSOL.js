const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128, option,
} = require('./layout-base')


const TOKEN_LAYOUT = struct([
  publicKey('mint'),
  publicKey('owner'),
  uint64('amount'),
  u32('delegateOption'),
  publicKey('delegate'),
  u8('state'),
  u32('isNativeOption'),
  uint64('isNative'),
  uint64('delegatedAmount'),
  u32('closeAuthorityOption'),
  publicKey('closeAuthority')
])

const Fee = [
  u64("denominator"),
  u64("numerator"),
]

const Lockup = [
  u64("unixtime"),
  u64("epoch"),
  publicKey("custodian"),
]

// https://github.com/igneous-labs/stake-pool-sdk/blob/master/src/stake-pool/schema.ts
const SCN_STAKE_POOL = struct([
  u8("accountType"),
  publicKey("manager"),
  publicKey("staker"),
  publicKey("depositAuthority"),
  u8("withdrawBumpSeed"),
  publicKey("validatorList"),
  publicKey("reserveStake"),
  publicKey("poolMint"),
  publicKey("managerFeeAccount"),
  publicKey("tokenProgramId"),
  u64("totalStakeLamports"),
  u64("poolTokenSupply"),
  u64("lastUpdateEpoch"),
  struct(Lockup, "lockup"),
  struct(Fee, "fee"),
  seq(struct(Fee), 1, "nextEpochFee"),
  option(publicKey(), "preferredDepositValidatorVoteAddress"),
  option(publicKey(), "preferredWithdrawValidatorVoteAddress"),
  struct(Fee, "stakeDepositFee"),
  struct(Fee, "withdrawalFee"),
  seq(struct(Fee), 1, "nextWithdrawalFee"),
  u8("stakeReferralFee"),
  option(publicKey(), "solDepositAuthority"),
  struct(Fee, "solDepositFee"),
  u8("solReferralFee"),
]);

module.exports = {
  TOKEN_LAYOUT,
  SCN_STAKE_POOL,
};