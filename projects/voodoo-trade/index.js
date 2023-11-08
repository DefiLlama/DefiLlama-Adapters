const { gmxExports } = require("../helper/gmx");
const { pool2 } = require("../helper/pool2");

const vault = "0x4F188Afdc40e6D2Ddddf5fd1b2DF7AEF7Da52f50";
const lpToken = "0xbF65A2775F0a091a8e667a1c1345c427C9D86761";
const stakedLpTokenTracker = "0x1DD46Dd21F152f97848b32D504de491E696bA1C5";

module.exports = {
  base: {
    tvl: gmxExports({ vault }),
    pool2: pool2(
      stakedLpTokenTracker,
      lpToken,
      "base",
    ),
  },
};