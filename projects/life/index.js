const { masterChefExports } = require("../helper/masterchef");

const chef = "0xa4Faa5774681AaccE968d5EC7Ff3C3eD0F7ABbEe"
const life = "0x8877E4B70C50CF275C2B77d6a0F69a312F5eE236"

module.exports = {
  ...masterChefExports(chef, "fantom", life, false),
} // node test.js projects/life/index.js