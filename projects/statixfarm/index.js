const { masterchefExports } = require("../helper/unknownTokens");

const masterchef = "0x32EeEd558c72Da99524E3b0176BCcbEd528cDFB2"
const nativeToken = "0xA28BAc0427e4a722246Ce4E9aD89Ec95FF8B87A3"

module.exports = masterchefExports({ chain: 'base', masterchef, nativeToken, useDefaultCoreAssets: true,})
