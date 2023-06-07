const { ohmTvl } = require("../helper/ohm");
const ADDRESSES = require("../helper/coreAssets.json");

const stakingToken = "0xBB366A397D7d4d2BEDABD9139D4c32a8826605Ed"; // SEX
const staking = "0xf1Bc988e7EaBA7a2dbF0121E6ad9BEA82A1AB1ff";
const treasury = "0x767d028d6d49ac86Aba52d23746c6dC5285C4852";
const treasuryTokens = [
  // DAI from Ethereum
  [ADDRESSES.pulse.DAI, false],
  // DAI-SEX PulseX LP V1
  ["0x2d593b3472d6a5439bC1523a04C2aec314CBc44c", true],
];
module.exports = ohmTvl(
  treasury,
  treasuryTokens,
  "pulse",
  staking,
  stakingToken,
  (addr) => `pulse:${addr}`,
  false,
  false
);
