const { masterChefExports } = require("../helper/masterchef");

const chef = "0x8c8953930634758B1e68C604fCb0B2Bc8F2f2893"
const philetairussocius = "0xc7Cc9D4010387Fc48e77a4Dc871FA39c26efaEEF"

module.exports = {
  ...masterChefExports(chef, "fantom", philetairussocius, false),
}