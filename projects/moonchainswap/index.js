const {getUniTVL} = require("../helper/cache/uniswap");

module.exports = {
    mxczkevm: {
        tvl: getUniTVL({ factory: "0x8bC7cf83f5F83781Ec85B78d866222987Ae24657", useDefaultCoreAssets: true })
    }
}