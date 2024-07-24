const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

//bsc
const bscVault = "0x47E3d600C6A58f262Bc6C0159D2C9cA75aaE12D0";
const bscStaking = "0x024CcD75EF4f772a3431e444c42Ee99452Afca01";
const srxToken = "0xdef49c195099e30e41b2df7dad55e0bbbe60a0c5";


module.exports = {
  hallmarks: [
    [1675209600, "Rug Pull"]
  ],
  bsc: {
    staking: staking(bscStaking, srxToken, "bsc", undefined, undefined),
    tvl: gmxExports({ vault: bscVault })
  }

};