const { staking } = require('../helper/staking');

const STAKING_CONTRACT = "0x24b3909b653e0cc635c7c7d4f8c176fc3fc88fd9";
const TOKEN_ADDRESS = "0xfDC933Ff4e2980d18beCF48e4E030d8463A2Bb07";

module.exports = {
  methodology: 'Counts the number of $owockibot tokens staked in the native staking contract on Base network.',
  base: {
    tvl: () => ({}),
    staking: staking(STAKING_CONTRACT, TOKEN_ADDRESS),
  }
}
