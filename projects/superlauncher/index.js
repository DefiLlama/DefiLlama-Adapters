const { stakings } = require("../helper/staking");

const LAUNCH = "0xF6D9a093A1C69a152d87e269A7d909E9D76B1815";
const STAKING_CONTRACT = "0xA05385Ec1F4fFe5a43336f3864Ae66f536D95602";

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: () => ({}),
    staking: stakings([STAKING_CONTRACT], [LAUNCH], 'era','superlauncher-dao',18)
  },
  methodology: "TVL is calculated by summing the total LAUNCH held in the staking contract.",
};