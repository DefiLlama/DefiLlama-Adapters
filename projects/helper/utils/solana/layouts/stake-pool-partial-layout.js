const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128, option,
} = require('./layout-base')

const STAKE_POOL_PARTIAL = struct([
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
]);

module.exports = {
  STAKE_POOL_PARTIAL,
};