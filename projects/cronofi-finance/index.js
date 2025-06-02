const {masterChefExports} = require('../helper/masterchef');


const masterchef = "0xdc0E1690c594dDD1654544e74036Ee0b0029573d";
const token = "0x3Df064069Ba2c8B395592E7834934dBC48BbB955";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "cronos", token, false)
}