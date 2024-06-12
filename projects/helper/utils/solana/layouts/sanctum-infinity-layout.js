const {
  struct,
  s32,
  u8,
  u16,
  seq,
  blob,
  Layout,
  bits,
  u32,
  publicKey,
  uint64,
  u64,
  uint128,
  u128,
  option,
} = require("./layout-base");

// https://github.com/igneous-labs/stake-pool-sdk/blob/master/src/stake-pool/schema.ts
const SANCTUM_INFINITY = struct([
  u64("totalSolValue"),
  u16("tradingProtocolFeeBps"),
  u16("lpProtocolFeeBps"),
  u8("version"),
  u8("isDisabled"),
  u8("isRebalancing"),
  u8("padding"),
  publicKey("admin"),
  publicKey("rebalanceAuthority"),
  publicKey("protocolFeeBeneficiary"),
  publicKey("pricingProgram"),
  publicKey("lpTokenMint"),
]);

module.exports = {
  SANCTUM_INFINITY,
};
