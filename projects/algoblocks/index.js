const { staking } = require("../helper/staking");

const ALGOBLOCKS_TOKEN_CONTRACT = "0xfecCa80fF6DeB2B492E93df3B67f0C523Cfd3a48";
const ALGOBLOCKS_STAKING_POOL = "0xaC87dE420894eAA8234d288334FAec08bB46ffe7";

module.exports = {
  methodology: "We are computing the tvl from algoblocks staking pools.",
  bsc: {
    tvl: () => 0,
    staking: staking(ALGOBLOCKS_STAKING_POOL, ALGOBLOCKS_TOKEN_CONTRACT),
  },
};
