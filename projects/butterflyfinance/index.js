const { masterchefExports } = require("../helper/unknownTokens");

const masterchef = "0xab2ec5bDeEf83a457FBEA2d36f60443d668b0689"
const nativeToken = "0xbA5e6D1B37978c4fee748EED33142171678DC840"

module.exports = masterchefExports({ chain: 'avax', masterchef, nativeToken, useDefaultCoreAssets: true,})