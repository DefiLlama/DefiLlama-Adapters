const { masterChefExports } = require("../helper/masterchef");

const chef = "0xfc30fE377f7E333cC1250B7768107a7Da0277c44"
const stipend = "0x2de4BA963636beDdE79ea7cc42796315E27f44ac"

module.exports = {
  ...masterChefExports(chef, "kava", stipend),
  methodology: "TVL includes all farms in MasterChef contract",
}