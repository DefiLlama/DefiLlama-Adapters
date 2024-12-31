const { staking } = require('../helper/staking');

const vaderAddress = '0x731814e491571a2e9ee3c5b1f7f3b962ee8f4870';

module.exports = {
  base: {
    tvl: () => ({}),
    staking: staking(
      '0x1d6bb701eecedcd53966402064ce1c5b9eddc780',
      vaderAddress
    ),
  },
  methodology: "$VADER coins can be staked in the protocol to earn rewards.",
};
