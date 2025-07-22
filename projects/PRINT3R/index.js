const { gmxExports } = require("../helper/gmx");

// Base
const baseVault = "0x102B73Ca761F5DFB59918f62604b54aeB2fB0b3E";
const modeVault = "0x3901B2e6d966dA5772A634a632bccCc83DC5Cf4C";

module.exports = {
  base: {
    tvl: gmxExports({ vault: baseVault }),
  },
  mode: {
    tvl: gmxExports({ vault: modeVault }),
  },
};
