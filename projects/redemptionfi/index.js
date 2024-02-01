const { masterchefExports } = require("../helper/unknownTokens");

const masterchef = "0x5c6c79Ff5a58bBC3D7903f439b3A75415685eca3"
const nativeToken = "0x41E99e0F73a88947C52070FF67C19B7aBc171A54"

module.exports = masterchefExports({ chain: 'base', masterchef, nativeToken, useDefaultCoreAssets: true,})