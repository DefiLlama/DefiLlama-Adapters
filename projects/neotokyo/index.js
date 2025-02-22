const { staking } = require("../helper/staking");

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      "0x67e1eCFA9232E27EAf3133B968A33A9a0dCa9e16",
      "0xa19f5264F7D7Be11c451C093D8f92592820Bea86"
    ),
  },
};
