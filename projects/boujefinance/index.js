const { masterChefExports } = require("../helper/masterchef");

const chef = "0x89dcd1DC698Ad6A422ad505eFE66261A4320D8B5"
const bouje = "0x37F70aa9fEfc8971117BD53A1Ddc2372aa7Eec41"

module.exports = {
  ...masterChefExports(chef, "fantom", bouje),
  methodology: "TVL includes all farms in MasterChef contract",
} 