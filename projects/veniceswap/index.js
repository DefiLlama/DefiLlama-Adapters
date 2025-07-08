const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  methodology: `Uses factory(0x5a75C65a96445eD0a4dDC1C1E35DF24B1DA3fe6a) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  findora: {
    tvl: getUniTVL({ factory: '0x5a75C65a96445eD0a4dDC1C1E35DF24B1DA3fe6a', useDefaultCoreAssets: true }),
  },
};