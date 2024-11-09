const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
    misrepresentedTokens: true,
    apechain: {
        tvl: getUniTVL({ factory: '0x57bfFa72db682f7eb6C132DAE03FF36bBEB0c459', useDefaultCoreAssets: true })
    }
};