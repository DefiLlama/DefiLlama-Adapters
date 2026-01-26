const { staking } = require('../helper/staking')
const CM_TOKEN_CONTRACT = "0x8A5d7FCD4c90421d21d30fCC4435948aC3618B2f";
const CM_STAKING_CONTRACT = "0xF7CDDF60CD076d4d64c613489aA00dCCf1E518F6";

module.exports = {
  methodology:
    "counts the number of $MONSTA tokens in the Cake Monster Staking contract, excluding the amount reserved for the staking rewards.",
  bsc: {
    tvl: () => ({}),
    staking: staking(CM_STAKING_CONTRACT, CM_TOKEN_CONTRACT),
  },
};
