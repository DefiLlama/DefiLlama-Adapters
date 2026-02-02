const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    xlayer: { tvl: getUniTVL({ factory: "0x32f2C88B2096088CF0e5Ea67D62ee1bf950d5D6e", useDefaultCoreAssets: true, }), },
    misrepresentedTokens: true,
}