const { masterChefExports } = require("../helper/masterchef");

const dogiumToken  = "0x55BD2a3904C09547c3A5899704f1207eE61878Be";
const masterchef = "0x579BACCd9DdF3D9e652174c0714DBC0CD4700dF2";

module.exports = masterChefExports(masterchef, "dogechain", dogiumToken);
