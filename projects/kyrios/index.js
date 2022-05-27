const { masterChefExports } = require("../helper/masterchef");

const token = "0xdbf8a44f447cf6fa300fa84c2aac381724b0c6dd"
const masterchef = "0x7aAa607A456607dd03496065ebBAC52f74c905bE";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "fantom", token, false)
}