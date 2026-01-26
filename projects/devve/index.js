const { staking } = require('../helper/staking');

module.exports = {
  methodology: "DEVVE can be staked in the protocol",
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      "0xa0dab5d6907a9CFFD023e0160210eAB464322b70", 
      "0x8248270620Aa532E4d64316017bE5E873E37cc09"
    ),
  },
};
