const { masterChefExports } = require("../helper/masterchef");

const chef = "0xf908ed281f008eE3FcEaCfF2FdfbC2dADf213811"
const fatfire = "0xa5ee311609665Eaccdbef3BE07e1223D9dBe51de"

module.exports = {
  ...masterChefExports(chef, "fantom", fatfire, false),
} // node test.js projects/fatfire/index.js