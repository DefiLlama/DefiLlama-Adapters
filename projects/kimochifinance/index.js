const { masterChefExports } = require("../helper/masterchef");

const MasterChefContract = "0xc88264770C43826dE89bCd48a5c8BC5073e482a5";
const KIMOCHI = "0x4dA95bd392811897cde899d25FACe253a424BfD4";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContract, "bsc", KIMOCHI),
  methodology: "TVL includes all farms in MasterChef contract",
};
