const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");

const cgpt = "0x9840652DC04fb9db2C43853633f0F62BE6f00f98";
const stakingpool1 = "0x765a6ee976137801F2661c3644E1fde369A8ED18";
const stakingpool2 = "0x62A402DEf6Ca37E9CA7a544bE34954748088CCEE";
const mcLPPool = "0x44c01e5e4216f3162538914d9c7f5E6A0d87820e";
const mcLPPoolV2 = "0xebE3CA21e37723E0bE0F519724798fe8EEfF83D1";
const mcWETHUNILP = "0xcCb63225a7B19dcF66717e4d40C9A72B39331d61";

module.exports = {
  bsc: {
    tvl: async () => ({}),
   // pool2: pool2s([mcLPPool, mcLPPoolV2], [mcWETHUNILP]),
    staking: stakings([stakingpool1, stakingpool2], cgpt),
  },
};