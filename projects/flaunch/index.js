const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
    base: {
        tvl: async (api) => {
            return {
                [`base:${ADDRESSES.base.WETH}`]: await api.call({ target: "0x000000000d564d5be76f7f0d28fe52605afc7cf8", abi: "uint:underlyingETHBalance" })
            }
        }
    }
}