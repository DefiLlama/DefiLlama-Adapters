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

const SANCTUM_LST_STATE_SCHEMA = [
  u8("isInputDisabled"),
  u8("poolReservesBump"),
  u8("protocolFeeAccumulatorBump"),
  u8("padding"),
  u64("solValue"),
  publicKey("mint"),
  publicKey("solValueCalculator"),
];

const SANCTUM_LST_STATE_LIST_SCHEMA = seq(
  struct(SANCTUM_LST_STATE_SCHEMA),
  1,
  "lstStateList"
);

module.exports = {
  SANCTUM_LST_STATE_LIST_SCHEMA,
  SANCTUM_LST_STATE_SCHEMA,
};
