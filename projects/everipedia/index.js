const { staking } = require("../helper/staking");

const stakingContracthiIQ = "0x1bF5457eCAa14Ff63CC89EFd560E251e814E16Ba";
const IQ = "0x579cea1889991f68acc35ff5c3dd0621ff29b0c9";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: (async) => ({}),
    staking: staking(stakingContracthiIQ, IQ), 
  },
  methodology: "Counts liquidty on the staking only",
};
