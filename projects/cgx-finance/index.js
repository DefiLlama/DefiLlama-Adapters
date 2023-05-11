const { masterChefExports } = require("../helper/masterchef");

// --- Cronos Addresses ---
const MasterChefContractCronos = "0xd6b3bf54ef015259cc92880cd639c1f3c22e2b85";
const CGX_Cronos = "0x40ff4581cf2d6e4e07b02034105d6435d4f3f84c";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContractCronos, "cronos", CGX_Cronos, false),
  methodology:
    "TVL includes all Farms and Pools seccion through MasterChef Contracts",
};
