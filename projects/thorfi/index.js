const { pool2 } = require("../helper/pool2");

const stakingPool2Contract = "0xd003A09719D45DB83C07872e18Bc3e1a69B4824a";
const WAVAX_THOR_JLP = "0x95189f25b4609120F72783E883640216E92732DA";

module.exports = {
  misrepresentedTokens: true,
  avax: {
    pool2: pool2(stakingPool2Contract, WAVAX_THOR_JLP),
    tvl: (async) => ({}),
  },
  methodology: "Counts liquidty on pool2 only",
};
