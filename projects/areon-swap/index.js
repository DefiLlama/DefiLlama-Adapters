const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "HyperSwap Tvl Calculation",
    area: {
        tvl: getUniTVL({ factory: '0x4df039804873717bff7d03694fb941cf0469b79e', useDefaultCoreAssets: true }),
    }
}