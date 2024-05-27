const { stakings } = require("../helper/staking");

const stakingContracts = [
  // stakingContract1 =
  "0xbb595f34190c6ea1add1c78f6d12df181542763c",
];

const ETH_DRAGON_UNIV2 = "0xd53881caee96d3a94fd0e2eb027a05fd44d8c470";
const DRAGON = "0x528757e34a5617aa3aabe0593225fe33669e921c";

module.exports = {
  misrepresentedTokens: true,
  base: {
    staking: stakings(stakingContracts, DRAGON),
    pool2: stakings(stakingContracts, [ETH_DRAGON_UNIV2]),
    tvl: (async) => ({}),
  },
  methodology: "Counts liquidty on the staking and pool2s only",
};
