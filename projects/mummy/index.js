const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

//Fantom
const fantomVault = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";
const fantomStaking = "0x727dB8FA7861340d49d13ea78321D0C9a1a79cd5";
const fantomMMY = "0x01e77288b38b416F972428d562454fb329350bAc";


module.exports = {
  hallmarks: [
    [1675242000,"sifu 2M deposit"]
  ],
  fantom: {
    staking: staking(fantomStaking, fantomMMY, "fantom", "mmy", 18),
    tvl: gmxExports({ vault: fantomVault })
  }

};
