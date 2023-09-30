const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");

const cgpt = "0x9840652DC04fb9db2C43853633f0F62BE6f00f98";
const stakingpool1 = "0x765a6ee976137801F2661c3644E1fde369A8ED18";
const stakingpool2 = "0x62A402DEf6Ca37E9CA7a544bE34954748088CCEE";


module.exports = {
  bsc: {
    tvl: async () => ({}),
    staking: stakings([stakingpool1, stakingpool2], cgpt),
  },
};