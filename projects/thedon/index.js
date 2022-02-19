const { masterChefExports } = require("../helper/masterchef");

const chef = "0xa50ACA2e1c94652Ab842E64410bCe53247eF88ac"
const thedon = "0x62E96896d417dD929A4966f2538631AD5AF6Cb46"

module.exports = {
  ...masterChefExports(chef, "fantom", thedon, false),
}
