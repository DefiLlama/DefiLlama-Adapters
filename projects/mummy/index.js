const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

//Fantom
const fantomVault = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";
const fantomStaking = "0x727dB8FA7861340d49d13ea78321D0C9a1a79cd5";
const fantomMMY = "0x01e77288b38b416F972428d562454fb329350bAc";

//Optimism
const opVault = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";
const opStaking = "0x04f23404553fcc388Ec73110A0206Dd2E76a6d95";
const opMMY = "0x47536f17f4ff30e64a96a7555826b8f9e66ec468";
//Arbitrum
const arbVault = "0x304951d7172bCAdA54ccAC1E4674862b3d5b3d5b";
const arbStaking = "0x52cC60893d3Bd8508baAB835620CbF9ddfA0A13C";
const arbMMY = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";
module.exports = {
  hallmarks: [
    [1675242000,"sifu 2M deposit"]
  ],
  fantom: {
    staking: staking(fantomStaking, fantomMMY, "fantom"),
    tvl: gmxExports({ vault: fantomVault })
  },
  optimism: {
    staking: staking(opStaking, opMMY, "optimism"),
    tvl: gmxExports({ vault: opVault })
  },
  arbitrum: {
    staking: staking(arbStaking, arbMMY, "arbitrum"),
    tvl: gmxExports({ vault: arbVault })
  }

};
