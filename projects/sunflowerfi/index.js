const { masterChefExports } = require("../helper/masterchef");

const MasterChefContract = "0x226771f35B00aE9bD4d0dde18dAdA9d24d772223";
const SFO = "0x3295fdE99976e6B6b477E6834b2651a22DeB1dd7";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContract, "bsc", SFO),
  methodology: "TVL includes all farms in MasterChef contract",
};