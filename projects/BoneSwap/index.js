const { masterChefExports } = require("../helper/masterchef");

// --- dogechain addresses ---
const MasterChefContractDC = "0x7fB524301283BCc0dEf0FaECc19c490bCEeB67AC";
const BoneDEX = "0x16d0046597b0E3B136CDBB4edEb956D04232A711";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContractDC, "dogechain", BoneDEX, false),
  methodology:
    "TVL includes all Farms and Pools seccion through MasterChef Contracts",
};