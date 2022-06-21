const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { stakingPricedLP } = require('../helper/staking');

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xa098751D407796d773032f5Cc219c3e6889fB893) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  bsc: {
    tvl: calculateUsdUniTvl(
      "0xa098751D407796d773032f5Cc219c3e6889fB893",
      "bsc",
      "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      [
       "0x5badD826AeFa700446Fa6d784e6ff97eD6eeDca9"         
      ],
      "wbnb"
    ),
    staking: stakingPricedLP("0x259C852834375864b65202375558AB11B2d330fd", "0x5badD826AeFa700446Fa6d784e6ff97eD6eeDca9", "bsc", "0x1Da189c1BA3d718Cc431a2ed240a3753f89CD47A", "wbnb")
  },
};