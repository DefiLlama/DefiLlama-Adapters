const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    xlayer: { tvl: getUniTVL({ factory: "0x630db8e822805c82ca40a54dae02dd5ac31f7fcf", useDefaultCoreAssets: true, }), },
    misrepresentedTokens: true,
}