const { staking } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const BSWAPStakingContract = "0x7B2dAC429DF0b39390cD3D4E6a8b8bcCeB331E2D";
const BSWAP = "0xacc234978a5eb941665fd051ca48765610d82584";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(BSWAPStakingContract, BSWAP),
    tvl: getUniTVL({ factory: '0xCe8fd65646F2a2a897755A1188C04aCe94D2B8D0', useDefaultCoreAssets: true }),
  },
  methodology:
    "Factory address on BSC (0xCe8fd65646F2a2a897755A1188C04aCe94D2B8D0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
