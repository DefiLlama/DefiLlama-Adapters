const { masterchefExports } = require("../helper/unknownTokens");

const wtfdogeToken  = "0xeF7B2204B5c4DCe2b30600B89e1C11bb881f3564";
const masterchef = "0x03b487A2Df5ddc6699C545eB1Da27D843663C8b8";

module.exports = masterchefExports({ chain: 'dogechain', masterchef, useDefaultCoreAssets: true, nativeTokens: [wtfdoge],  })