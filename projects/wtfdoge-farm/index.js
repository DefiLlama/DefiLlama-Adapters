const { masterchefExports } = require('../helper/unknownTokens')


const chef = "0x03b487A2Df5ddc6699C545eB1Da27D843663C8b8"
const waterfall = "0xeF7B2204B5c4DCe2b30600B89e1C11bb881f3564"
const waterfallDogLP = "0x62b44635A4AeBcA4D329AdD86BC34d00869eF4d2"
const waterfallUsdcLP = "0x52d8E261cfdc7E62e783611b0bB6a3064dF9FC05";

module.exports = masterchefExports({ chain: 'dogechain', nativeToken: waterfall, masterchef: chef, useDefaultCoreAssets: true, lps: [waterfallDogLP, waterfallUsdcLP, ]})