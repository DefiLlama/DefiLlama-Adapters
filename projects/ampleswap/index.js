const { staking } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const MasterChefContract = "0xeb642d600bf593cb21e1551e9a15426ff6d42f82";
const AMPLE = "0x335f6e0e804b70a96bf9eb8af31588942e9b2515";

module.exports = {
  methodology: `Uses factory(0x381fefadab5466bff0e8e96842e8e76a143e8f73) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  misrepresentedTokens: true,
  incentivized: true,
  bsc: {
    tvl: getUniTVL({ factory: '0x381fefadab5466bff0e8e96842e8e76a143e8f73', useDefaultCoreAssets: true }),
    staking: staking(MasterChefContract, AMPLE),
  }
};
