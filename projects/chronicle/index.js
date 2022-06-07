const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const farmContract = "0x0eC4EE75bF85b553F471ad82839229316B358FB0";
const XNL_BUSD_CakeLP = "0x879fC01b663396aEA410259E7be200dC7049F518";
const XNL = "0x5f26fa0c2ee5d3c0323d861d0c503f31ac212662";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(farmContract, XNL, "bsc"),
    pool2: pool2(farmContract, XNL_BUSD_CakeLP, "bsc"),
  },
  tvl: (async) => ({}),
  methodology: "Counts liquidty on the staking and pool2 only",
};
