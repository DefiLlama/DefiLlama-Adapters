const { staking } = require("../helper/staking");

const stakingContract = "0xc24A365A870821EB83Fd216c9596eDD89479d8d7";
const POLS = "0x83e6f1E41cdd28eAcEB20Cb649155049Fac3D5Aa";

const stakingContract_bsc = "0xD558675a8c8E1fd45002010BaC970B115163dE3a";
const POLS_bsc = "0x7e624fa0e1c4abfd309cc15719b7e2580887f570";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: (async) => ({}),
    staking: staking(stakingContract, POLS),  
  },
  bsc: {
    staking: staking(stakingContract_bsc, POLS_bsc),
  },
  methodology: "Counts liquidty on the staking only",
};
