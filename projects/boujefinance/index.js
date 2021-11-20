const abi = require("../helper/abis/masterchef.json")
const { masterChefExports } = require("../helper/masterchef");


const chef = "0x89dcd1DC698Ad6A422ad505eFE66261A4320D8B5"
const bouje = "0x37F70aa9fEfc8971117BD53A1Ddc2372aa7Eec41"

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      ...masterChefExports(chef, "fantom", bouje)
  },
  ...masterChefExports(chef, "fantom", bouje)
} 