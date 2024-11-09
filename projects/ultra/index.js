const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const stakingContract = "0x69dC0B62b73B596Ced10710f799ECD6CBBC032f5";
const ULTRA_WBNB_CakeLP = "0x48bAc97D5E3116626A56704BE7399E1Cb593A945";
const ULTRA = "0x0b3f42481c228f70756dbfa0309d3ddc2a5e0f6a";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(stakingContract, ULTRA),
    pool2: pool2(stakingContract, ULTRA_WBNB_CakeLP),
    tvl: (async) => ({}),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
