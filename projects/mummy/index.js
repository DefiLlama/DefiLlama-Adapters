const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");
const { mergeExports } = require("../helper/utils");

//Fantom
const fantomVault = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";
const fantomStaking = "0x727dB8FA7861340d49d13ea78321D0C9a1a79cd5";
const fantomMMY = "0x01e77288b38b416F972428d562454fb329350bAc";

//FantomV2
const fantomV2Vault = "0x7e9E9d925846B110B025041cfdF9942f2C401F4F";
const fantomV2Staking = "0x2301d1AF7f00FfF41F8ecb250eee399972d23530";

//Optimism
const opVault = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";
const opStaking = "0x04f23404553fcc388Ec73110A0206Dd2E76a6d95";
const opMMY = "0x47536f17f4ff30e64a96a7555826b8f9e66ec468";
//Arbitrum
const arbVault = "0x304951d7172bCAdA54ccAC1E4674862b3d5b3d5b";
const arbStaking = "0x52cC60893d3Bd8508baAB835620CbF9ddfA0A13C";
const arbMMY = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";

const baseVault = "0xA6D7D0e650aa40FFa42d845A354c12c2bc0aB15f";
const baseStaking = "0xFfB69477FeE0DAEB64E7dE89B57846aFa990e99C";
const baseMMY = "0x0d8393CEa30df4fAFA7f00f333A62DeE451935C1";
let tvlExports = mergeExports([
  {
    fantom: {
      staking: staking(fantomV2Staking, fantomMMY),
      tvl: gmxExports({ vault: fantomV2Vault })
    }
  },
  {
  fantom: {
    staking: staking(fantomStaking, fantomMMY),
    tvl: gmxExports({ vault: fantomVault })
  },
  optimism: {
    staking: staking(opStaking, opMMY),
    tvl: gmxExports({ vault: opVault })
  },
  arbitrum: {
    staking: staking(arbStaking, arbMMY),
    tvl: gmxExports({ vault: arbVault })
  },
  base: {
    staking: staking(baseStaking, baseMMY),
    tvl: gmxExports({ vault: baseVault })
  },
}]);
tvlExports.hallmarks = [
  ['2023-02-01', "sifu 2M deposit"]
];
module.exports = tvlExports;
