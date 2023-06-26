const { gmxExports } = require("../helper/gmx");
const { pool2 } = require("../helper/pool2");

const vault = "0x40cbDDAED8b0d7Ee3cF347aAb09Bf4a8cFa15F01";
const lpToken = "0xC42437A6da389D88799A9e706da3EA6628342295";
const stakedLpTokenTracker = "0xBf47b011C36F29e7C65b6cf34c1d838EA1b67069";

module.exports = {
  fantom: {
    tvl: gmxExports({ vault }),
    pool2: pool2(stakedLpTokenTracker, lpToken,),
  },
};