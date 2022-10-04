const { pool2 } = require("../helper/pool2");

const stakingContract = "0x19C7798a756e353F6585302B8cb71Fd31DEa83AF";
const WAVAX_PXT2_JPL = "0x326238CfAf10Fc6f536791b548441D03B80dacA8";
//const PXT2 = "0x9e20Af05AB5FED467dFDd5bb5752F7d5410C832e";

module.exports = {
  avax: {
    pool2: pool2(stakingContract, WAVAX_PXT2_JPL, "avax"),
    tvl: (async) => ({}),
  },
  methodology: "Counts liquidty on the Pool2 only",
};
