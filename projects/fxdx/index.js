const { gmxExports } = require("../helper/gmx");

const optimismvault = "0x10235996C4DAbCE8430a71Cbc06571bd475A1d0C";

module.exports = {
  optimism: {
    tvl: gmxExports({ vault: optimismvault }),
  },
};
