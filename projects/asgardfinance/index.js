const { staking } = require('../helper/staking');

const AsgardStaking = "0x4EA2bb6Df87F66cbea70818aE92f3A48F98EBC93";
const ASG = "0x0DC5189Ec8CDe5732a01F0F592e927B304370551";

module.exports = {
  hallmarks: [
    [1643155200, "Token mint exploit"]
  ],
  ethereum: {
    staking: staking(AsgardStaking, ASG),
    tvl: () => ({}),
  },
  deadFrom: '2021-08-28',
  methodology:
    "Counts DAI, DAI SLP (ASG-DAI), FRAX, FRAX SLP (ASG-FRAX), UST, UST SLP (ASG-UST) on the treasury",
};
