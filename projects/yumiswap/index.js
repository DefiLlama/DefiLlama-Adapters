const { getUniTVL } = require('../helper/unknownTokens')

const FACTORIES = "0xD3CFB8A232Ad5D0A7ABc817ae3BD1F3E7AE4b5E0"

module.exports = {
        methodology: "TVL comes from the DEX liquidity pools",
    astar: {
        tvl: getUniTVL({ factory: FACTORIES, useDefaultCoreAssets: true }),
    }
}