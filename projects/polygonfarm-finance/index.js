const { masterChefExports } = require("../helper/masterchef");

const spadeToken = "0xf5EA626334037a2cf0155D49eA6462fDdC6Eff19";
const masterchef = "0x9A2C85eFBbE4DD93cc9a9c925Cea4A2b59c0db78";

module.exports = masterChefExports(masterchef, "polygon", spadeToken);
