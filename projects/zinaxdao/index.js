const {masterChefExports} = require('../helper/masterchef');


const masterchef = "0x323d2B52F63e38F7b933eA9a0Eb763D2C81B97Ba";
const token = "0xFf3Aa0D4874C3BD5AdcBB94254005ff19f798AcB";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}