const { masterChefExports } = require("../helper/masterchef");

const MasterChefContract = "0x378085c11dc493ED90BD582ddA2F248e98388DaD";
//const masterchef = "0x13f57Af2042365C03894ECAA81d07D7C29f4B5a9"
const SOL = "0xFEa6aB80cd850c3e63374Bc737479aeEC0E8b9a1";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContract, "bsc", SOL),
  methodology: "TVL includes all farms in MasterChef contract",
};
