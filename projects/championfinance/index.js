const { pool2 } = require('../helper/pool2')
const { stakings } = require("../helper/staking");

const chamTokenAddress = "0xc65bC1E906771e105fBAcBD8dfE3862Ee7BE378E";
const chamRewardPoolAddress = "0x649EfBF7D96B06a2bD0fB134621AC9dD031923A4";
const boardroomAddress = [
    "0x2d1a3d4D070B469C84E92d01dB0f94F1159Dbf3e",
    "0x6001Ca31953459704ba7eA44A9387f68B4f1B639", // EVIC CHAM address
    "0xa23a7Ca585d4651F1cf6277Cd29f5D7D344441e8", // EVIC-WETH.e address
  ];

const lps = [
  "0x7748456409D4Eee3FaCE6aD0c492DD9853A1CC3d", // AVICUsdcLpAddress
  "0xd6F18CDe9A52A9D815dd3C03C2325D453E32BDef", //CHAMUsdcLpAddress
  "0x8392a728aEe00a26E99AF8e837c33591944e033a", // EVIC-WETH.e Address
];

module.exports = {
  avax: {
    tvl: () => ({}),
    pool2: pool2(chamRewardPoolAddress, lps),
    staking: stakings(boardroomAddress, chamTokenAddress)
  }
}; 
