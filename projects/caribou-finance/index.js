const {masterChefExports} = require("../helper/masterchef")

const token = "0x2dBa3ea510cf7bFCCc9c185b7c9094d687ADE503";
const masterchef = "0x23bd5312cE63AC23651112d3c9638C082aaeAf38";

module.exports = {
    ...masterChefExports(masterchef, "fantom", token, false)
}