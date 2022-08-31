const { masterChefExports } = require("../helper/masterchef");

const chef = "0x51839D39C4Fa187E3A084a4eD34a4007eae66238"
const bastille = "0xcef2b88d5599d578c8d92E7a6e6235FBfaD01eF4"

module.exports = {
  ...masterChefExports(chef, "fantom", bastille, false),
}