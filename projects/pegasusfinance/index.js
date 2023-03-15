const { staking } = require("../helper/staking");

const LIQUIDITY_POOL_CONTRACT = "0x7398c321449d836cec83582a678ccb8650360a18";
const WETH_OPTIMISM = "0x4200000000000000000000000000000000000006";

module.exports = {
  methodology: "WETH supplied to liquidity pool + leftover weth in treasury",
  optimism: {
    tvl: staking(LIQUIDITY_POOL_CONTRACT, WETH_OPTIMISM, "optimism"),
  },
};
