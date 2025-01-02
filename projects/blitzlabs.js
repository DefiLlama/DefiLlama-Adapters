const { stakings } = require("./helper/staking");

const singleStakingContracts = [
    "0x8A6297d1df7d0c84f0d5F600Fe601b6d9Ce32F53",
];

const LPStakingContracts = [
    "0xAfCEE27282dFC68Eb4b7aecbFDFfA1FA8A04dbf7",
]

const BUSD_BLITZ_CAKELP = "0x000d27d4DfB3e336a6462A3435C3dd3953391bb7";
const BLITZ = "0xF376807DcdbAa0d7FA86E7c9EAcC58d11ad710E4";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: stakings(singleStakingContracts, BLITZ),
    pool2: stakings(LPStakingContracts, BUSD_BLITZ_CAKELP),
    tvl: async () => ({}),
  },
  methodology: "Counts liquidty on the staking and pool2s only",
}
