const { masterChefExports } = require("../helper/masterchef");

const chef = "0x6c2a485A118bF387a0c9E0dD9f8a90a31056FDc3"
const leaf = "0x1777850a0c498D38424CeA45fd324C68f06D0830"

module.exports = {
  ...masterChefExports(chef, "avax", leaf, false),
  methodology: "TVL includes all farms in MasterChef contract",
  hallmarks: [
    [1647043200, "Rug Pull"]
  ]
}