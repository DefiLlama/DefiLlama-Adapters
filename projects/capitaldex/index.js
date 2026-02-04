const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address in Ethereum(0x03407772F5EBFB9B10Df007A2DD6FFf4EdE47B53) and in Curio(0xc36f5180b181f1b949e0ff4d65b258e0987f443f) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereum: {
    tvl: getUniTVL({ factory: '0x03407772F5EBFB9B10Df007A2DD6FFf4EdE47B53', useDefaultCoreAssets: true }),
  },
  curio: {
    // tvl: getUniTVL({ factory: '0xc36f5180b181f1b949e0ff4d65b258e0987f443f', useDefaultCoreAssets: true }),
  },
};