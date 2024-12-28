const { masterchefExports } = require("../helper/unknownTokens");

const token = "0x2A3C691e08262aC2406aB9C3ee106C59Fff3E5ec";
const masterchef = "0x4bddb586DdD8F05b5C229BC66F5D71Ccb10e9a18";
const chain = "dogechain";

module.exports = masterchefExports({ chain, masterchef, nativeTokens: [token], useDefaultCoreAssets: true, })
