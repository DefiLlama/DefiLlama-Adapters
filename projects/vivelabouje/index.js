const { masterChefExports } = require("../helper/masterchef");

const chef = "0x1277dd1dCbe60d597aAcA80738e1dE6cB95dCB54"
const vive = "0xE509Db88B3c26D45f1fFf45b48E7c36A8399B45A"

module.exports = {
  ...masterChefExports(chef, "fantom", vive, false),
}