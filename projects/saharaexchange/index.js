const { getUniTVL } = require('../helper/unknownTokens')

const ANKH  = "0x043694e7d4F10C1030A1D739694e9C2dA34ff7c7"
module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    oasis: {
        tvl: getUniTVL({ factory: '0x9D7B4519C7bED9a1e1307F8f84975DBc7a1D3C75', useDefaultCoreAssets: true }),
    }
}