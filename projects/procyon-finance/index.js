const { masterChefExports } = require("../helper/masterchef");

const PcyMasterChefContract = "0x27e85F98B48D447D0148AFeCa7b149b0E69c2c2e";
const PcyToken = "0xAd421C4F5F091f597361080d47B6f44ED44F155a";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(PcyMasterChefContract, "cronos", PcyToken, false),
  methodology:
    "TVL includes all Farms and Pools seccion through MasterChef Contracts",
};
