const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x04b611A65A5cfEFC1C449F725b1948eeaadEB231";
module.exports = ohmTvl(treasuryAddress, [
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
  ["0x1E2D68196AcF7EB9e345c531e476E726D60a5C4b", true],
], "avax", "0xE0474c15BC7f8213eE5bfB42f9E68B2d6BE2e136", "0x91D680545a1ff4411C1ff4C927f86CD34ADB932a", undefined, undefined, true)
