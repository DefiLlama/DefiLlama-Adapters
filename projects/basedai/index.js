const { staking } = require('../helper/staking');

const CONTRACTS = [
  "0xa6b816010ab51e088c4f19c71aba87e54b422e14", // pepe
  "0x44971ABF0251958492FeE97dA3e5C5adA88B9185" // basedAI
]

const TOKENS = [
  "0xA9E8aCf069C58aEc8825542845Fd754e41a9489A",
  "0x44971ABF0251958492FeE97dA3e5C5adA88B9185"
]

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      CONTRACTS,
      TOKENS
    )
  },
  methodology: "Currently, the TVL is considered as the amount of Pepecoin and basedAI tokens held in the farming contracts."
};
