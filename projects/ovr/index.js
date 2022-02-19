const { stakings } = require("../helper/staking");

const stakingContract = [
    "0xc947FA28527A06cEE53614E1b77620C1b7D3A75D",
    "0xCa0F390C044FD43b1F38B9D2A02e06b13B65FA48"
];

const OVR = "0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContract, OVR),
  },
  tvl: (async) => ({}),
  methodology: "Counts liquidty on the staking only",
};
