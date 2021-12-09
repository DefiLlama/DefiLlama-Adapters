const { ohmTvl } = require("../helper/ohm");

const LuxorStaking = "0xf3F0BCFd430085e198466cdCA4Db8C2Af47f0802";

const LUX = "0x6671E20b83Ba463F270c8c75dAe57e3Cc246cB2b";

const treasuryAddresses = "0xDF2A28Cc2878422354A93fEb05B41Bd57d71DB24";

const DAI = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
const LUX_DAI = "0x46729c2AeeabE7774a0E710867df80a6E19Ef851";
const WFTM = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";

module.exports = ohmTvl(
  treasuryAddresses,
  [
    [DAI, false],
    [LUX_DAI, true],
    [WFTM, false],
  ],
  "fantom",
  LuxorStaking,
  LUX,
  (addr) => {
    if (addr === "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e") {
      return "0x6b175474e89094c44da98b954eedeac495271d0f";
    }
    return `fantom:${addr}`;
  }
);
