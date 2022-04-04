const { staking } = require("../helper/staking");

const token = "0x776fB4B2fA2CFfe3E7C1DDaA71dA52c09d87C37e";
const stakeContract = 0;
const bankContract = 0;


module.exports = {
  avalanche: {
    tvl: async () => ({}),
    staking: staking(stakeContract, bankContract, "avax")
  }
}