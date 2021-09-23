const { masterChefExports } = require("../helper/masterchef");

const storm = "0x6AFD5A1ea4b793CC1526d6Dc7e99A608b356eF7b"
const MasterChefContract = "0xc1A97bCbaCf0566fc8C40291FFE7e634964b0446";

module.exports = {
  ...masterChefExports(MasterChefContract, "avax", storm, ["0x551D0b15423d391d89cb3C5E6fB1BF9B28495Fe4", "0x9613Acd03dcb6Ee2a03546dD7992d7DF2aa62d9a"]),
  methodology:
    "We count liquidity on the Fields (LP tokens) and Lagoons(single tokens) sections through MasterChef Contract",
};
