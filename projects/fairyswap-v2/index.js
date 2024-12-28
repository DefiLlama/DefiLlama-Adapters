const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  methodology: `Uses factory(0xA2DD9611675927281070dB095599D31a8D4a007A) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  findora: {
    tvl: getUniTVL({ factory: '0xA2DD9611675927281070dB095599D31a8D4a007A', useDefaultCoreAssets: true,  }),
  },
};