const { masterChefExports } = require("../helper/masterchef");

const storm = "0x6AFD5A1ea4b793CC1526d6Dc7e99A608b356eF7b"
const MasterChefContract = "0xc1A97bCbaCf0566fc8C40291FFE7e634964b0446";

module.exports = {
  ...masterChefExports(MasterChefContract, "avax", storm),
  methodology:
    "We count liquidity on the Fields (LP tokens) and Lagoons(single tokens) sections through MasterChef Contract",
};
