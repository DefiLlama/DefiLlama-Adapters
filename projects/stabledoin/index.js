const { masterchefExports } = require("../helper/unknownTokens");

const token = "0x507D8340B2A1fB72F5672E0a2AD28873a81e2339";
const masterchef = "0x32d979A69249452898071c2eD1A689dCa659AD93";
const chain = "dogechain";

module.exports = masterchefExports({ chain, masterchef, nativeTokens: [token], useDefaultCoreAssets: true, })
