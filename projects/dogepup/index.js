const { masterchefExports } = require("../helper/unknownTokens");

const token = "0x1b15b9446b9f632a78396a1680DAaE17f74Ce8d9";
const masterchef = "0xc6dEcf90D8171B0E17f367C9f2fA4560C73845da";
const chain = "dogechain";

module.exports = masterchefExports({ chain, masterchef, nativeTokens: [token], useDefaultCoreAssets: true, })
