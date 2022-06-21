const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0xf73055C88f8cF87E0cfaE6773665943083609640";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const Staking = "0x1450d20E99F7e8c27864a8D9e6E3d0694ed567DA";
const ZD = "0x98051143830fa99848E7059E97AcB03B3cc62403";

const ZD_USDT_POOL = "0x4cb107576c7f3d59e3355ce760af5cbc36cf5e0d";
module.exports = ohmTvl(treasuryAddress, [
  [USDT, false],
  [ZD_USDT_POOL, true],
], "bsc", Staking, ZD)
