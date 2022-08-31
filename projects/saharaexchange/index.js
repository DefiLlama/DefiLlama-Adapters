const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const ANKH  = "0x043694e7d4F10C1030A1D739694e9C2dA34ff7c7"
module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    oasis: {
        tvl: calculateUsdUniTvl(
            "0x9D7B4519C7bED9a1e1307F8f84975DBc7a1D3C75",
            "oasis",
            "0x5C78A65AD6D0eC6618788b6E8e211F31729111Ca",
            [ANKH],
            "oasis-network"
        ),
    }
}