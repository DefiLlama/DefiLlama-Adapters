const { masterchefExports } = require("../helper/unknownTokens");

const dogiumToken  = "0x55bd2a3904c09547c3a5899704f1207ee61878be";
const masterchef = "0x579BACCd9DdF3D9e652174c0714DBC0CD4700dF2";

module.exports = masterchefExports({ chain: 'dogechain', masterchef, useDefaultCoreAssets: true, nativeTokens: [dogiumToken],  })