const { sumTokens2 } = require("../helper/unwrapLPs");

const MYC_TOKEN = "0xC74fE4c715510Ec2F8C61d70D397B32043F55Abe";
const STAKING_ADDRESS = "0x9B225FF56C48671d4D04786De068Ed8b88b672d6";
const chain = "arbitrum";

const getStakingTvl = () => {
  return async (_, _block, { [chain]: block }) => {
    const sumTokens = await sumTokens2({
      owner: STAKING_ADDRESS,
      tokens: [MYC_TOKEN],
      chain,
      block,
    });

    return sumTokens;
  };
};

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getStakingTvl(),
  },
  methodology:
    "We count liquidity in Staking through the LentMyc contract.",
};
