const { staking } = require("../helper/staking");

const VGX = "0x3C4B6E6e1eA3D4863700D7F76b36B7f3D3f13E3d";
const stakingContract = "0x8692e782ea478623f3342e0fb3936f6530c5d54f";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(stakingContract, VGX), 
  },
  methodology: "Voyager token VGX can be staked",
};
