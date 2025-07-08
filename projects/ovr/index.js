const { stakings } = require("../helper/staking");

const stakingContract = [
  "0xc947FA28527A06cEE53614E1b77620C1b7D3A75D",
  "0xCa0F390C044FD43b1F38B9D2A02e06b13B65FA48",
];

const OVR = {
  eth: "0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697",
  polygon: "0x1631244689EC1fEcbDD22fb5916E920dFC9b8D30",
};

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: stakings(stakingContract, OVR.eth),
    vesting: stakings([
      "0xcee8fcbc9676a08b0a048180d99b41a7f080bb78",
      "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
    ], OVR.eth),
  },
  polygon: {
    staking: stakings([
      "0x7e98b560eFa48d8d04292EaF680E693F6EEfB534",
      "0x671F928505C108E49c006fb97066CFdAB34a2898",
    ], OVR.polygon),
  },
  methodology: "We count the tokens locked in the staking contract, the tokens in the IBCO reserve, and the tokens locked in vesting.",
};
