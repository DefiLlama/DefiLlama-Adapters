const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const CoverageContract = "0x69c316563414d091c57C7Ec098523e43Baa5E175";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";

const StakingContract_BMI = "0xDfB820b95EEE42A858f50BEfbF834D2d24621153";
const BMI = "0x725c263e32c72ddc3a19bea12c5a0479a81ee688";

const StakingContract_BMI_ETH = "0x49791b39B8cb01ad5f207c296123fD772D5C0d62";
const BMI_ETH_UNIV2 = "0xa9Bd7EEF0c7AfFbdBDAE92105712E9Ff8b06Ed49";

const ethTvl = async (...params) => {
  return staking(CoverageContract, USDT)(...params);
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(StakingContract_BMI, BMI),
  },
  pool2: {
    tvl: pool2(StakingContract_BMI_ETH, BMI_ETH_UNIV2),
  },
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "We count liquidity on the pool2, and it counts the staking of native token separtly",
};
