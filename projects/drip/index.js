const { staking } = require("../helper/staking");

const TOKEN_CONTRACT = "0x20f663CEa80FaCE82ACDFA3aAE6862d246cE0333";
const VAULT_CONTRACT = "0xBFF8a1F9B5165B787a00659216D7313354D25472";

module.exports = {
      methodology:
    "Counts the native tokens staked in the vault contract as staking.",
  bsc: {
    tvl: async () => ({}),
    staking: staking(VAULT_CONTRACT, TOKEN_CONTRACT),
  },
};
