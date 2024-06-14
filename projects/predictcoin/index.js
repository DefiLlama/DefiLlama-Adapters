const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const farmContract = "0x4b74C42b7aB96fEec003563c355f2fEfD0C80ee7";
const lpContracts = [
  //PRED_BUSD-T_BabyLP
  "0x47893DC78bE9231a031e594EB29636D3FCdA09B9",
  //PRED_BUSD_CakeLP
  "0xf38db36C3E1b2A93BA0EdA1ee49A86f9CbCA6980",
  //PRED_WBNB_CakeLP
  "0x3e4dfC6A8F2f1851b0694592D06DE5254afE820d",
];
const PRED = "0xbdD2E3fdb879AA42748E9D47b7359323f226BA22";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: (async) => ({}),
    staking: staking(farmContract, PRED),
    pool2: pool2s([farmContract], lpContracts),
  },
  methodology: "Counts liquidty on the staking and Farming",
};
