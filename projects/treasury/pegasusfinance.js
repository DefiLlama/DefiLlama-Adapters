const { staking } = require("../helper/staking");

const TREASURY_CONTRACT = "0x680b96DDC962349f59F54FfBDe2696652669ED60";
const WETH_OPTIMISM = "0x4200000000000000000000000000000000000006";

module.exports = {
  optimism: {
    tvl: staking(TREASURY_CONTRACT, WETH_OPTIMISM),
  },
};
