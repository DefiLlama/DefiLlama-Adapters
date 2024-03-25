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

const SANCTUM_LST_STATE = struct([
  u8("isInputDisabled"),
  u8("poolReservesBump"),
  u8("protocolFeeAccumulatorBump"),
  seq(u8("padding"), 5),
  u64("solValue"),
  publicKey("mint"),
  publicKey("solValueCalculator"),
]);

const parseSanctumLstStateList = (account) => {
  const { data, space } = account;
  const buffer = Buffer.from(data);
  const length = space / 80;
  return seq(
    SANCTUM_LST_STATE,
    length,
    "lstStateList"
  ).decode(buffer);
}


module.exports = {
  parseSanctumLstStateList,
};
