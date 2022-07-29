const { masterChefExports, } = require("../helper/masterchef")

const token = "0x01d3569eedd1dd32a698cab22386d0f110d6b548";
const masterchef = "0xAedCc6E2710d2E47b1477A890C6D18f7943C0794";

module.exports = {
    ...masterChefExports(masterchef, "fantom", token, false)
}
