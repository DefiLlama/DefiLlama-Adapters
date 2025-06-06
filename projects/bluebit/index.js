const { staking } = require("../helper/staking");

const token = "0x4148d2Ce7816F0AE378d98b40eB3A7211E1fcF0D";
const veToken = "0xdf7C547f332351A86DB0D89a89799A7aB4eC9dEB";

module.exports = {
  methodology: "The vaults on https://bluebit.fi are included in TVL.",
  aurora: {
    tvl: () => ({}),
    staking: staking(veToken, token),
  },
  deadFrom: '2025-06-01',
};
