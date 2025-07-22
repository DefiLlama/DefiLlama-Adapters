const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  polygon: {
    tvl: getUniTVL({ factory: '0x5be44d6C5634161CdaDcC2bc35389325aa493e83', useDefaultCoreAssets: true }),
  },
  ethereum: {
    tvl: getUniTVL({ factory: '0xB919aD419688F7C274f11F180112514941a910CB', useDefaultCoreAssets: true }),
  },
};