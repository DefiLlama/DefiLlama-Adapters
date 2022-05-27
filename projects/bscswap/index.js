const { staking } = require("../helper/staking");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const BSWAPStakingContract = "0x7B2dAC429DF0b39390cD3D4E6a8b8bcCeB331E2D";
const BSWAP = "0xacc234978a5eb941665fd051ca48765610d82584";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(BSWAPStakingContract, BSWAP, "bsc"),
    tvl: calculateUsdUniTvl(
      "0xCe8fd65646F2a2a897755A1188C04aCe94D2B8D0",
      "bsc",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      [
        "0x55d398326f99059ff775485246999027b3197955",
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      ],
      "WBNB"
    ),
  },
  methodology:
    "Factory address on BSC (0xCe8fd65646F2a2a897755A1188C04aCe94D2B8D0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
