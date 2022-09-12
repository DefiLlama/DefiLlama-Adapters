const { tombTvl } = require("../helper/tomb");

const avicTokenAddress = "0x59B18817CA9f4ad2dEE6FBf30132dF6AEb9D763d";
const chamTokenAddress = "0xc65bC1E906771e105fBAcBD8dfE3862Ee7BE378E";
const chamRewardPoolAddress = "0x649EfBF7D96B06a2bD0fB134621AC9dD031923A4";
const boardroomAddress = "0x2d1a3d4D070B469C84E92d01dB0f94F1159Dbf3e";

const usdcLPs = [
  "0x7748456409D4Eee3FaCE6aD0c492DD9853A1CC3d", // AVICUsdcLpAddress
  "0xd6F18CDe9A52A9D815dd3C03C2325D453E32BDef", //CHAMUsdcLpAddress
];

module.exports = {
    ...tombTvl(avicTokenAddress, chamTokenAddress, chamRewardPoolAddress, boardroomAddress, usdcLPs, "avax", undefined, false, usdcLPs[1])
}
